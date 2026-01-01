import { Platform } from 'react-native';

import Constants from 'expo-constants';

export const APP_CONFIG = {
    NAME: process.env.EXPO_PUBLIC_APP_NAME || 'M4Hub',
    VERSION: '1.0.0',
    ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
    // Smart API URL detection
    API_URL: (() => {
        // In Development, if on Android Emulator, use 10.0.2.2
        // We prioritize this over env var because env var usually contains machine LAN IP which Emulator might not reach
        if (__DEV__ && Platform.OS === 'android' && !Constants.isDevice) {
            return 'http://10.0.2.2:8080';
        }

        // Otherwise use environment variable or fallbacks
        // 192.168.1.2 is the developer machine IP, verified reachable
        return process.env.EXPO_PUBLIC_API_URL ||
            (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://192.168.1.2:8080');
    })(),
    ENABLE_LOGGING: process.env.EXPO_PUBLIC_ENABLE_LOGGING === 'true' || __DEV__,
} as const;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN_EMAIL: '/api/auth/login',
        SEND_EMAIL_OTP: '/api/auth/send-email-otp',
        VERIFY_EMAIL_OTP: '/api/auth/verify-email-otp',
        RESEND_EMAIL_OTP: '/api/auth/resend-email-otp',
        LOGOUT: '/api/auth/logout',
    },
    USER: {
        PROFILE: '/api/users/profile',
        UPDATE_PROFILE: '/api/users/profile',
        VERIFY_EMAIL: '/api/users/verify-email',
    },
    DASHBOARD: {
        HOME: '/api/dashboard',
    },
    MUSIC: {
        SONGS: '/api/music/songs',
        SEARCH: '/api/music/search',
        SYNC: '/api/music/sync',
        FAVORITES: '/api/music/favorites',
        FAVORITES_TOGGLE: '/api/music/favorites/toggle',
        WISHLIST: '/api/music/wishlist',
        WISHLIST_TOGGLE: '/api/music/wishlist/toggle',
        TRENDING: '/api/music/trending',
        ALBUMS: '/api/music/albums',
        ARTISTS: '/api/music/artists',
    },
} as const;

export const STORAGE_KEYS = {
    AUTH_TOKEN: '@m4hub:auth_token',
    USER_DATA: '@m4hub:user_data',
    PHONE_NUMBER: '@m4hub:phone_number',
    THEME_PREFERENCE: '@m4hub:theme',
    LANGUAGE: '@m4hub:language',
} as const;

export const VALIDATION = {
    OTP: {
        LENGTH: 6,
        REGEX: /^[0-9]{6}$/,
    },
    EMAIL: {
        REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 50,
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50,
    },
} as const;

export const TIMEOUT = {
    OTP_RESEND: 30, // seconds
    API_REQUEST: 30000, // milliseconds
    SESSION: 604800000, // 7 days in milliseconds
} as const;

export const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
] as const;

export const FEATURE_CARDS = [
    {
        id: 'music',
        title: 'Music',
        description: 'Stream your favorite songs',
        icon: '🎵',
        route: '/music',
        color: '#FF2D55',
    },
    {
        id: 'message',
        title: 'Messages',
        description: 'Chat with friends',
        icon: '💬',
        route: '/messages',
        color: '#5856D6',
    },
    {
        id: 'money',
        title: 'Money Transfer',
        description: 'Send and receive money',
        icon: '💰',
        route: '/money',
        color: '#34C759',
    },
    {
        id: 'news',
        title: 'Morning Update',
        description: 'Stay updated with news',
        icon: '📰',
        route: '/news',
        color: '#FF9500',
    },
] as const;
