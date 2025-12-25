/**
 * API Slice - RTK Query for API calls with axios baseQuery for React Native
 * Replaces Redux Thunk/Saga with built-in caching and loading states
 */

import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { APP_CONFIG } from '@/constants';
import type { RootState } from '../store';

interface SendOtpRequest {
    phoneNumber: string;
}

interface SendOtpResponse {
    success: boolean;
    message: string;
}

interface VerifyOtpRequest {
    phoneNumber: string;
    otpCode: string;
}

interface UserData {
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

interface VerifyOtpResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: UserData;
}

// Custom axios baseQuery for React Native compatibility
const axiosBaseQuery = (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
): BaseQueryFn<
    {
        url: string;
        method: AxiosRequestConfig['method'];
        data?: AxiosRequestConfig['data'];
        params?: AxiosRequestConfig['params'];
    },
    unknown,
    unknown
> => async ({ url, method, data, params }, { getState }) => {
    try {
        const state = getState() as RootState;
        const token = state.auth.token;

        const result = await axios({
            url: baseUrl + url,
            method,
            data,
            params,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        return { data: result.data };
    } catch (axiosError) {
        const err = axiosError as AxiosError;
        return {
            error: {
                status: err.response?.status,
                data: err.response?.data || err.message,
            },
        };
    }
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({ baseUrl: APP_CONFIG.API_URL }),
    tagTypes: ['Auth', 'User'],
    endpoints: (builder) => ({
        // Send OTP
        sendOtp: builder.mutation<SendOtpResponse, SendOtpRequest>({
            query: (body) => ({
                url: '/api/auth/send-otp',
                method: 'POST',
                data: body,
            }),
        }),

        // Verify OTP
        verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
            query: (body) => ({
                url: '/api/auth/verify-otp',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        // Get user profile (future endpoint)
        getUserProfile: builder.query<UserData, void>({
            query: () => ({
                url: '/api/user/profile',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useSendOtpMutation,
    useVerifyOtpMutation,
    useGetUserProfileQuery,
} = apiSlice;
