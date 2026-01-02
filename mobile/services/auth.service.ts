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
    code?: string; // Error code like 'INVALID_CREDENTIALS', 'EMAIL_NOT_VERIFIED', etc.
    status?: number; // HTTP status code (401, 403, 429, etc.)
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

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to send OTP',
                    status: response.status,
                    code: data.code || this.getErrorCodeFromStatus(response.status)
                };
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
    async verifyEmailOtp(email: string, otpCode: string, password?: string, source?: string): Promise<AuthResponse> {
        try {
            config.log('Verifying Email OTP for:', email);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP}`;
            const payload = { email, otpCode, password, registrationSource: source };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Failed to verify OTP',
                    status: response.status,
                    code: data.code || this.getErrorCodeFromStatus(response.status)
                };
            }

            config.log('Email verified successfully');
            return data;
        } catch (err) {
            config.error('Error verifying Email OTP:', err);
            throw err;
        }
    }

    async login(identifier: string, password: string): Promise<AuthResponse> {
        try {
            config.log('Logging in user:', identifier);

            const url = `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN_EMAIL}`;
            const payload = { email: identifier, password }; // Backend uses 'email' field for both email and username

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                config.error('Non-JSON response received:', await response.text());
                return {
                    success: false,
                    message: 'Server error. Please try again later.',
                    status: response.status,
                    code: 'SERVER_ERROR'
                };
            }

            const data: AuthResponse = await response.json();

            // Capture HTTP status code for error handling
            if (!response.ok) {
                // Include the HTTP status code and any error code from backend
                return {
                    success: false,
                    message: data.message || 'Login failed',
                    status: response.status,
                    code: data.code || this.getErrorCodeFromStatus(response.status)
                };
            }

            // Ensure we have the required fields for successful login
            if (!data.token || !data.user) {
                config.error('Login response missing required fields:', data);
                return {
                    success: false,
                    message: 'Invalid server response. Please try again.',
                    status: 500,
                    code: 'INVALID_RESPONSE'
                };
            }

            config.log('Login successful');
            return {
                success: true,
                message: data.message || 'Login successful',
                token: data.token,
                user: data.user
            };
        } catch (err: any) {
            config.error('Error during login:', err);
            // Re-throw to let the calling code handle it with ErrorHandler
            throw err;
        }
    }

    /**
     * Helper method to map HTTP status codes to error codes
     */
    private getErrorCodeFromStatus(status: number): string {
        switch (status) {
            case 401:
                return 'INVALID_CREDENTIALS';
            case 403:
                return 'EMAIL_NOT_VERIFIED';
            case 429:
                return 'RATE_LIMITED';
            default:
                return 'UNKNOWN_ERROR';
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
                return {
                    success: false,
                    message: data.message || 'Failed to resend OTP',
                    status: response.status,
                    code: data.code || this.getErrorCodeFromStatus(response.status)
                };
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
                return {
                    success: false,
                    message: data.message || 'Failed to reset password',
                    status: response.status,
                    code: data.code || this.getErrorCodeFromStatus(response.status)
                };
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
                return {
                    success: false,
                    message: data.message || 'Failed to reset password',
                    status: response.status,
                    code: data.code || this.getErrorCodeFromStatus(response.status)
                };
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
