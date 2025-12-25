'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';
import logger from '@/utils/logger';

/**
 * SessionManager - Restores auth state from localStorage on app mount
 */
export function SessionManager() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        // Only run on client side
        if (typeof window !== 'undefined') {
            try {
                const token = localStorage.getItem('authToken');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    const user = JSON.parse(userStr);

                    // Restore auth state
                    dispatch(restoreAuth({ token, user }));
                } else {
                    // No session found, set loading to false
                    dispatch(restoreAuth(null));
                }
            } catch (error) {
                logger.error('Session restoration failed', { error });
                // Clear invalid data
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                dispatch(restoreAuth(null));
            }
        }
    }, [dispatch]);

    return null; // This component doesn't render anything
}
