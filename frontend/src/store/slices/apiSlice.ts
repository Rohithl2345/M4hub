/**
 * API Slice for Next.js - RTK Query
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '@/utils/env';

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

interface RootState {
    auth: {
        token: string | null;
    };
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: env.apiUrl,
        timeout: 30000,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Auth', 'User'],
    endpoints: (builder) => ({
        sendOtp: builder.mutation<SendOtpResponse, SendOtpRequest>({
            query: (body) => ({
                url: '/api/auth/send-otp',
                method: 'POST',
                body,
            }),
        }),
        verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
            query: (body) => ({
                url: '/api/auth/verify-otp',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),
        getUserProfile: builder.query<UserData, void>({
            query: () => '/api/user/profile',
            providesTags: ['User'],
        }),
    }),
});

export const {
    useSendOtpMutation,
    useVerifyOtpMutation,
    useGetUserProfileQuery,
} = apiSlice;
