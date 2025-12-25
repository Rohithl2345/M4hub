/**
 * Storage Service
 * Handles AsyncStorage operations for persistent data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { config } from '../config';

export interface UserData {
    id: number;
    phoneNumber: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    isVerified: boolean;
    isActive: boolean;
}

class StorageService {
    /**
     * Save auth token
     */
    async saveAuthToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            config.log('Auth token saved');
        } catch (err) {
            config.error('Error saving auth token:', err);
            throw err;
        }
    }

    /**
     * Get auth token
     */
    async getAuthToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            return token;
        } catch (err) {
            config.error('Error getting auth token:', err);
            return null;
        }
    }

    /**
     * Remove auth token
     */
    async removeAuthToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            config.log('Auth token removed');
        } catch (err) {
            config.error('Error removing auth token:', err);
            throw err;
        }
    }

    /**
     * Save user data
     */
    async saveUserData(userData: UserData): Promise<void> {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.USER_DATA,
                JSON.stringify(userData)
            );
            config.log('User data saved');
        } catch (err) {
            config.error('Error saving user data:', err);
            throw err;
        }
    }

    /**
     * Get user data
     */
    async getUserData(): Promise<UserData | null> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            config.error('Error getting user data:', err);
            return null;
        }
    }

    /**
     * Remove user data
     */
    async removeUserData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            config.log('User data removed');
        } catch (err) {
            config.error('Error removing user data:', err);
            throw err;
        }
    }

    /**
     * Save phone number
     */
    async savePhoneNumber(phoneNumber: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phoneNumber);
            config.log('Phone number saved');
        } catch (err) {
            config.error('Error saving phone number:', err);
            throw err;
        }
    }

    /**
     * Get phone number
     */
    async getPhoneNumber(): Promise<string | null> {
        try {
            const phoneNumber = await AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER);
            return phoneNumber;
        } catch (err) {
            config.error('Error getting phone number:', err);
            return null;
        }
    }

    /**
     * Clear all auth data
     */
    async clearAuthData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.AUTH_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.PHONE_NUMBER,
            ]);
            config.log('All auth data cleared');
        } catch (err) {
            config.error('Error clearing auth data:', err);
            throw err;
        }
    }

    /**
     * Check if user is logged in
     */
    async isLoggedIn(): Promise<boolean> {
        try {
            const token = await this.getAuthToken();
            return token !== null;
        } catch (err) {
            config.error('Error checking login status:', err);
            return false;
        }
    }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
