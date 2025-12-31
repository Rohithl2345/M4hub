/**
 * Hook to monitor network status
 */
import { useState, useEffect } from 'react';

export interface NetworkStatus {
    isOnline: boolean;
    isSlowConnection: boolean;
    effectiveType?: string;
}

export function useNetworkStatus(): NetworkStatus {
    // Safe defaults for SSR - assume online until client-side check
    const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
    const [isSlowConnection, setIsSlowConnection] = useState(false);
    const [effectiveType, setEffectiveType] = useState<string | undefined>();

    useEffect(() => {
        // Only run in browser environment
        if (typeof window === 'undefined') return;

        const handleOnline = () => {
            setIsOnline(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        const updateConnectionInfo = () => {
            const nav = navigator as Navigator & {
                connection?: {
                    effectiveType?: string;
                    saveData?: boolean;
                    addEventListener: (type: string, listener: EventListener) => void;
                    removeEventListener: (type: string, listener: EventListener) => void;
                };
                mozConnection?: any;
                webkitConnection?: any;
            };

            const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

            if (connection) {
                setEffectiveType(connection.effectiveType);
                // Consider '2g' or 'slow-2g' as slow connections
                setIsSlowConnection(
                    connection.effectiveType === '2g' ||
                    connection.effectiveType === 'slow-2g' ||
                    connection.saveData === true
                );
            }
        };

        // Set up event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Monitor connection changes if available
        const nav = navigator as Navigator & {
            connection?: {
                addEventListener: (type: string, listener: EventListener) => void;
                removeEventListener: (type: string, listener: EventListener) => void;
            }
        };

        const connection = nav.connection;
        if (connection) {
            connection.addEventListener('change', updateConnectionInfo);
            updateConnectionInfo();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (connection) {
                connection.removeEventListener('change', updateConnectionInfo);
            }
        };
    }, []);

    return {
        isOnline,
        isSlowConnection,
        effectiveType
    };
}
