/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { APP_CONFIG, API_ENDPOINTS } from '../constants';
import { config } from '../config';

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: any;
}

class AuthService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = APP_CONFIG.API_URL;
        config.log('AuthService initialized with baseUrl:', this.baseUrl);
    }

    /**
     * Send OTP to email for signup
     */
    async sendEmailOtp(email: string, password?: string): Promise<AuthResponse> {
        try {
            config.log('Sending Email OTP to:', email);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.SEND_EMAIL_OTP}`;
            const payload = { email, password };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: AuthResponse = await response.json();

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
     * Verify Email OTP
     */
    async verifyEmailOtp(email: string, otpCode: string, password?: string): Promise<AuthResponse> {
        try {
            config.log('Verifying Email OTP for:', email);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP}`;
            const payload = { email, otpCode, password };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify OTP');
            }

            config.log('Email verified successfully');
            return data;
        } catch (err) {
            config.error('Error verifying Email OTP:', err);
            throw err;
        }
    }

    /**
     * Login with Email/Username and Password
     */
    async login(identifier: string, password: string): Promise<AuthResponse> {
        try {
            config.log('Logging in user:', identifier);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN_EMAIL}`;
            const payload = { email: identifier, password }; // Backend uses 'email' field for both email and username

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            config.log('Login successful');
            return data;
        } catch (err) {
            config.error('Error during login:', err);
            throw err;
        }
    }

    /**
     * Resend Email OTP
     */
    async resendEmailOtp(email: string, password?: string): Promise<AuthResponse> {
        try {
            config.log('Resending Email OTP to:', email);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.RESEND_EMAIL_OTP}`;
            const payload = { email, password };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            config.log('OTP resent successfully');
            return data;
        } catch (err) {
            config.error('Error resending OTP:', err);
            throw err;
        }
    }

    /**
     * Forgot Password
     */
    async forgotPassword(email: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> {
        try {
            config.log('Resetting password for:', email);

            const url = `${this.baseUrl}/api/auth/forgot-password`;
            const payload = { email, newPassword, confirmPassword };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            return data;
        } catch (err) {
            config.error('Error resetting password:', err);
            throw err;
        }
    }

    /**
     * Validate email format
     */
    validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Validate password complexity
     * Matches backend requirements:
     * - At least 8 characters
     * - One uppercase letter
     * - One number
     * - One special character
     */
    validatePassword(password: string): { valid: boolean; message?: string } {
        if (!password || password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one special character' };
        }
        return { valid: true };
    }

    /**
     * Reset Password (Forgot Password)
     */
    async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<AuthResponse> {
        try {
            config.log('Resetting password for:', email);

            const url = `${this.baseUrl}/api/auth/forgot-password`;
            const payload = { email, newPassword, confirmPassword };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            config.log('Password reset successfully');
            return data;
        } catch (err) {
            config.error('Error resetting password:', err);
            throw err;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
