/**
 * Auth Slice - Manages authentication state
 * Uses Redux Toolkit's createSlice for less boilerplate
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storageService, UserData } from '@/services/storage.service';

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

            // Persist to AsyncStorage
            storageService.saveAuthToken(action.payload.token);
            storageService.saveUserData(action.payload.user);
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;

            // Clear from AsyncStorage
            storageService.clearAuthData();
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
        markTutorialSeen: (state) => {
            if (state.user) {
                state.user.hasSeenTutorial = true;
                storageService.saveUserData(state.user);
            }
        },
    },
});

export const { setCredentials, logout, setLoading, restoreAuth, markTutorialSeen } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
