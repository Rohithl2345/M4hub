'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './DashboardLayout.module.css';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

interface InactivityHandlerProps {
    onLogout: () => void;
    timeoutDuration?: number; // Total timeout in ms (e.g. 30 mins)
    warningDuration?: number; // Warning duration in ms (e.g. 5 mins)
}

export default function InactivityHandler({
    onLogout,
    timeoutDuration = 30 * 60 * 1000,
    warningDuration = 5 * 60 * 1000
}: InactivityHandlerProps) {
    const [timeLeft, setTimeLeft] = useState(timeoutDuration);
    const [showWarning, setShowWarning] = useState(false);

    // Use refs for mutable values to avoid effect dependencies
    const lastActivityRef = useRef(Date.now());
    const warningShownRef = useRef(false);

    const resetTimer = useCallback(() => {
        // If warning is shown, require explicit button click (handled by handleContinue)
        // So we only update last activity if warning is NOT shown
        if (!warningShownRef.current) {
            lastActivityRef.current = Date.now();
        }
    }, []);

    const handleContinue = () => {
        lastActivityRef.current = Date.now();
        warningShownRef.current = false;
        setShowWarning(false);
        setTimeLeft(timeoutDuration);
    };

    // Format milliseconds to MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Activity Listeners
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Throttled event handler
        let timeoutId: NodeJS.Timeout;
        const handleActivity = () => {
            if (!timeoutId) {
                resetTimer();
                timeoutId = setTimeout(() => {
                    // clear token
                    (timeoutId as any) = null;
                }, 1000); // Throttle to 1s
            }
        };

        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [resetTimer]);

    // Timer Interval
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;
            const remaining = timeoutDuration - timeSinceLastActivity;

            if (remaining <= 0) {
                // Time expired
                clearInterval(interval);
                onLogout();
            } else if (remaining <= warningDuration) {
                // Warning zone
                if (!warningShownRef.current) {
                    warningShownRef.current = true;
                    setShowWarning(true);
                }
                setTimeLeft(remaining);
            } else {
                // Normal zone
                if (warningShownRef.current) {
                    warningShownRef.current = false;
                    setShowWarning(false);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timeoutDuration, warningDuration, onLogout]);

    if (!showWarning) return null;

    return (
        <div className={styles.timeoutOverlay}>
            <div className={styles.timeoutModal}>
                <div className={styles.timeoutIcon}>
                    <AccessTimeFilledIcon fontSize="inherit" />
                </div>
                <h2 className={styles.timeoutTitle}>Session Expiring</h2>
                <p className={styles.timeoutMessage}>
                    Your session will expire due to inactivity.
                    <br />
                    Please confirm you are still here.
                </p>

                <div className={styles.timeoutTimer}>
                    {formatTime(timeLeft)}
                </div>

                <button className={styles.timeoutButton} onClick={handleContinue}>
                    I'm still here
                </button>
            </div>
        </div>
    );
}
