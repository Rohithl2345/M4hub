/**
 * SessionManager - Restores auth state from AsyncStorage on app mount
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth } from './slices/authSlice';
import { storageService } from '@/services/storage.service';
import type { AppDispatch } from './store';

export function SessionManager() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const loadSession = async () => {
            try {
                const token = await storageService.getAuthToken();
                const user = await storageService.getUserData();

                if (token && user) {
                    // Restore auth state
                    dispatch(restoreAuth({ token, user }));
                } else {
                    // No session found, set loading to false
                    dispatch(restoreAuth(null));
                }
            } catch (error) {
                console.error('Error restoring session:', error);
                // Clear invalid data
                await storageService.clearAuthData();
                dispatch(restoreAuth(null));
            }
        };

        loadSession();
    }, [dispatch]);

    return null; // This component doesn't render anything
}
