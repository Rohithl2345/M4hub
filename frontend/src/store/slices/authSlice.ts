/**
 * Auth Slice for Next.js
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
    id: number;
    phoneNumber: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    username?: string;
    isVerified: boolean;
    isActive: boolean;
    hasSeenTutorial: boolean;
}

interface AuthState {
    token: string | null;
    user: UserData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; user: UserData }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isLoading = false;

            // Persist to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('authToken', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            }
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;

            // Clear from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        restoreAuth: (state, action: PayloadAction<{ token: string; user: UserData } | null>) => {
            if (action.payload) {
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            }
            state.isLoading = false;
        },
        updateUserEmail: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.email = action.payload;
                // Update localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            }
        },
        updateUsername: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.username = action.payload;
                // Update localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            }
        },
        updateUserPhone: (state, action: PayloadAction<string>) => {
            if (state.user) {
                state.user.phoneNumber = action.payload;
                // Update localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            }
        },
        markTutorialSeen: (state) => {
            if (state.user) {
                state.user.hasSeenTutorial = true;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(state.user));
                }
            }
        },
    },
});

export const { setCredentials, logout, setLoading, restoreAuth, updateUserEmail, updateUsername, updateUserPhone, markTutorialSeen } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
