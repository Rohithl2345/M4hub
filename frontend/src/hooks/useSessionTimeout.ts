'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UseSessionTimeoutOptions {
    timeoutDuration?: number; // Total session duration in milliseconds
    warningDuration?: number; // Warning duration before timeout in milliseconds
    onTimeout?: () => void;
    onWarning?: () => void;
    enabled?: boolean;
}

export function useSessionTimeout({
    timeoutDuration = 30 * 60 * 1000, // 30 minutes default
    warningDuration = 2 * 60 * 1000, // 2 minutes warning default
    onTimeout,
    onWarning,
    enabled = true,
}: UseSessionTimeoutOptions = {}) {
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(warningDuration / 1000);

    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const warningTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const lastActivityRef = useRef<number>(Date.now());

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }
    }, []);

    const handleLogout = useCallback(() => {
        clearTimers();
        setShowWarning(false);

        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Call custom timeout handler if provided
        if (onTimeout) {
            onTimeout();
        }

        // Redirect to login
        router.push('/auth/email-login?mode=login&reason=session_expired');
    }, [clearTimers, onTimeout, router]);

    const startWarning = useCallback(() => {
        setShowWarning(true);
        setRemainingTime(warningDuration / 1000);

        if (onWarning) {
            onWarning();
        }

        // Set final timeout
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, warningDuration);
    }, [warningDuration, onWarning, handleLogout]);

    const resetTimer = useCallback(() => {
        if (!enabled) return;

        clearTimers();
        setShowWarning(false);
        lastActivityRef.current = Date.now();

        // Set warning timeout
        warningTimeoutRef.current = setTimeout(() => {
            startWarning();
        }, timeoutDuration - warningDuration);
    }, [enabled, clearTimers, timeoutDuration, warningDuration, startWarning]);

    const extendSession = useCallback(() => {
        setShowWarning(false);
        resetTimer();
    }, [resetTimer]);

    // Track user activity
    useEffect(() => {
        if (!enabled) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            // Only reset if enough time has passed (debounce)
            if (timeSinceLastActivity > 1000) {
                if (!showWarning) {
                    resetTimer();
                }
            }
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize timer
        resetTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            clearTimers();
        };
    }, [enabled, resetTimer, clearTimers, showWarning]);

    // Update remaining time during warning
    useEffect(() => {
        if (!showWarning) return;

        const interval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [showWarning]);

    return {
        showWarning,
        remainingTime,
        extendSession,
        handleLogout,
        resetTimer,
    };
}
