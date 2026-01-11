/**
 * Server Wake-up Hook for M4Hub Mobile
 * Handles cold start scenarios gracefully with progressive loading states
 * and automatic server pre-warming for React Native
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { env } from '../utils/env';

export interface ServerStatus {
    isWarm: boolean;
    isWaking: boolean;
    wakeupAttempts: number;
    lastWakeupTime: number | null;
    error: string | null;
}

export interface WakeupProgress {
    stage: 'idle' | 'connecting' | 'warming' | 'ready' | 'error';
    message: string;
    progress: number; // 0-100
    elapsedSeconds: number;
}

// Progressive messages for better UX during cold starts
const WAKEUP_MESSAGES = [
    { seconds: 0, message: 'Connecting to server...' },
    { seconds: 3, message: 'Server is waking up...' },
    { seconds: 8, message: 'Almost there, please wait...' },
    { seconds: 15, message: 'Server is starting up (this may take a moment)...' },
    { seconds: 25, message: 'Still warming up... Thank you for your patience!' },
    { seconds: 40, message: 'Server is taking longer than usual. Hang tight!' },
];

const WAKEUP_CACHE_KEY = 'm4hub_server_wakeup_time';
const WAKEUP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useServerWakeup() {
    const [status, setStatus] = useState<ServerStatus>({
        isWarm: false,
        isWaking: false,
        wakeupAttempts: 0,
        lastWakeupTime: null,
        error: null,
    });

    const [progress, setProgress] = useState<WakeupProgress>({
        stage: 'idle',
        message: '',
        progress: 0,
        elapsedSeconds: 0,
    });

    const startTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check if server was recently warmed up (cached)
    const checkCachedWakeup = useCallback(async () => {
        try {
            const cached = await AsyncStorage.getItem(WAKEUP_CACHE_KEY);
            if (cached) {
                const lastWakeup = parseInt(cached, 10);
                const now = Date.now();
                if (now - lastWakeup < WAKEUP_CACHE_DURATION) {
                    setStatus(prev => ({ ...prev, isWarm: true, lastWakeupTime: lastWakeup }));
                    return true;
                }
            }
        } catch {
            // Ignore storage errors
        }
        return false;
    }, []);

    // Mark server as warm in cache
    const markServerWarm = useCallback(async () => {
        try {
            const now = Date.now();
            await AsyncStorage.setItem(WAKEUP_CACHE_KEY, now.toString());
            setStatus(prev => ({
                ...prev,
                isWarm: true,
                isWaking: false,
                lastWakeupTime: now,
                error: null,
            }));
            setProgress({
                stage: 'ready',
                message: 'Server is ready!',
                progress: 100,
                elapsedSeconds: 0,
            });
        } catch {
            // Ignore storage errors
        }
    }, []);

    // Update progress message based on elapsed time
    const updateProgressMessage = useCallback((elapsed: number) => {
        let currentMessage = WAKEUP_MESSAGES[0].message;
        let progressPercent = 0;

        for (let i = WAKEUP_MESSAGES.length - 1; i >= 0; i--) {
            if (elapsed >= WAKEUP_MESSAGES[i].seconds) {
                currentMessage = WAKEUP_MESSAGES[i].message;
                progressPercent = Math.min(90, (elapsed / 50) * 100);
                break;
            }
        }

        setProgress(prev => ({
            ...prev,
            message: currentMessage,
            progress: progressPercent,
            elapsedSeconds: elapsed,
        }));
    }, []);

    // Start tracking elapsed time
    const startProgressTracking = useCallback(() => {
        startTimeRef.current = Date.now();

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            if (startTimeRef.current) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                updateProgressMessage(elapsed);
            }
        }, 1000);
    }, [updateProgressMessage]);

    // Stop tracking
    const stopProgressTracking = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        startTimeRef.current = null;
    }, []);

    // Check if device is online
    const isDeviceOnline = useCallback(async (): Promise<boolean> => {
        try {
            const netState = await NetInfo.fetch();
            return netState.isConnected === true;
        } catch {
            return true; // Assume online if check fails
        }
    }, []);

    // Pre-warm the server (silent health check)
    const prewarmServer = useCallback(async () => {
        // Skip if already warm
        const isWarm = await checkCachedWakeup();
        if (isWarm) {
            return true;
        }

        // Check network connectivity
        const isOnline = await isDeviceOnline();
        if (!isOnline) {
            return false;
        }

        setStatus(prev => ({ ...prev, isWaking: true, error: null }));
        setProgress({
            stage: 'connecting',
            message: 'Connecting to server...',
            progress: 0,
            elapsedSeconds: 0,
        });
        startProgressTracking();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const response = await fetch(`${env.apiUrl}/api/health`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            stopProgressTracking();

            if (response.ok) {
                await markServerWarm();
                return true;
            }
        } catch (error: any) {
            stopProgressTracking();

            if (error.name !== 'AbortError') {
                setStatus(prev => ({
                    ...prev,
                    isWaking: false,
                    wakeupAttempts: prev.wakeupAttempts + 1,
                    error: 'Server is currently unavailable',
                }));
                setProgress({
                    stage: 'error',
                    message: 'Could not connect to server. Will retry on login.',
                    progress: 0,
                    elapsedSeconds: 0,
                });
            }
        }

        return false;
    }, [checkCachedWakeup, isDeviceOnline, markServerWarm, startProgressTracking, stopProgressTracking]);

    // Wrap a fetch request with retry logic for cold starts
    const fetchWithRetry = useCallback(async (
        url: string,
        options: RequestInit,
        maxRetries: number = 2,
        initialTimeout: number = 30000
    ): Promise<Response> => {
        let lastError: Error | null = null;

        setProgress({
            stage: 'connecting',
            message: 'Connecting to server...',
            progress: 0,
            elapsedSeconds: 0,
        });
        startProgressTracking();

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const timeout = initialTimeout + (attempt * 15000);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                setStatus(prev => ({ ...prev, isWaking: true, wakeupAttempts: attempt + 1 }));

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                stopProgressTracking();

                await markServerWarm();

                return response;
            } catch (error: any) {
                lastError = error;

                if (error.name === 'AbortError' && attempt < maxRetries) {
                    setProgress(prev => ({
                        ...prev,
                        message: `Request timed out. Retrying (${attempt + 1}/${maxRetries})...`,
                    }));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                if (error.message?.includes('Network request failed') && attempt < maxRetries) {
                    setProgress(prev => ({
                        ...prev,
                        stage: 'warming',
                        message: 'Server is waking up, retrying...',
                    }));
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }

                stopProgressTracking();
                throw error;
            }
        }

        stopProgressTracking();
        throw lastError || new Error('Request failed after retries');
    }, [markServerWarm, startProgressTracking, stopProgressTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopProgressTracking();
        };
    }, [stopProgressTracking]);

    // Check cache on mount
    useEffect(() => {
        checkCachedWakeup();
    }, [checkCachedWakeup]);

    return {
        status,
        progress,
        prewarmServer,
        fetchWithRetry,
        markServerWarm,
        isServerReady: status.isWarm,
    };
}

export default useServerWakeup;
