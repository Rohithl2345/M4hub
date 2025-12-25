/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { APP_CONFIG, API_ENDPOINTS } from '../constants';
import { config } from '../config';

export interface SendOtpRequest {
    phoneNumber: string;
}

export interface SendOtpResponse {
    success: boolean;
    message: string;
    token?: string;
}

export interface VerifyOtpRequest {
    phoneNumber: string;
    otpCode: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: number;
        phoneNumber: string;
        name?: string;
        email?: string;
        isVerified: boolean;
        isActive: boolean;
    };
}

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = APP_CONFIG.API_URL;
        config.log('AuthService initialized with baseUrl:', this.baseUrl);
    }

    /**
     * Send OTP to phone number
     */
    async sendOtp(phoneNumber: string): Promise<SendOtpResponse> {
        try {
            config.log('Sending OTP to:', phoneNumber);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.SEND_OTP}`;
            const payload: SendOtpRequest = { phoneNumber };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: SendOtpResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            config.log('OTP sent successfully');
            return data;
        } catch (err) {
            config.error('Error sending OTP:', err);
            throw err;
        }
    }

    /**
     * Verify OTP code
     */
    async verifyOtp(
        phoneNumber: string,
        otpCode: string
    ): Promise<VerifyOtpResponse> {
        try {
            config.log('Verifying OTP for:', phoneNumber);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.VERIFY_OTP}`;
            const payload: VerifyOtpRequest = { phoneNumber, otpCode };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: VerifyOtpResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify OTP');
            }

            config.log('OTP verified successfully');
            return data;
        } catch (err) {
            config.error('Error verifying OTP:', err);
            throw err;
        }
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber: string): {
        valid: boolean;
        message?: string;
    } {
        if (!phoneNumber || phoneNumber.trim().length === 0) {
            return { valid: false, message: 'Phone number is required' };
        }

        // Remove spaces and hyphens
        const cleaned = phoneNumber.replace(/[\s-]/g, '');

        // Check if it starts with country code
        if (!cleaned.startsWith('+')) {
            return {
                valid: false,
                message: 'Phone number must start with country code (e.g., +91)',
            };
        }

        // E.164 format validation: +[country code][number]
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        if (!e164Regex.test(cleaned)) {
            return {
                valid: false,
                message: 'Invalid phone number format. Use +[country code][number]',
            };
        }

        return { valid: true };
    }

    /**
     * Validate OTP code format
     */
    validateOtpCode(otpCode: string): { valid: boolean; message?: string } {
        if (!otpCode || otpCode.trim().length === 0) {
            return { valid: false, message: 'OTP code is required' };
        }

        if (otpCode.length !== 6) {
            return { valid: false, message: 'OTP must be 6 digits' };
        }

        if (!/^\d{6}$/.test(otpCode)) {
            return { valid: false, message: 'OTP must contain only numbers' };
        }

        return { valid: true };
    }

    /**
     * Format phone number to E.164
     */
    formatPhoneNumber(phoneNumber: string, countryCode: string = '+91'): string {
        // Remove all non-numeric characters except +
        let cleaned = phoneNumber.replace(/[^\d+]/g, '');

        // If it doesn't start with +, add country code
        if (!cleaned.startsWith('+')) {
            // Remove leading zeros
            cleaned = cleaned.replace(/^0+/, '');
            cleaned = `${countryCode}${cleaned}`;
        }

        return cleaned;
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
