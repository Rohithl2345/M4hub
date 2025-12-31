/**
 * Centralized Error Handler for M4Hub Mobile
 * Provides consistent error classification and user-friendly messages
 */

export interface AppError {
    code: string;
    message: string;
    userMessage: string;
    severity: 'error' | 'warning' | 'info';
    retryable: boolean;
    details?: any;
}

export class ErrorHandler {
    /**
     * Classify and format errors for user display
     */
    static handleError(error: any): AppError {
        // Network errors
        if (error.message?.includes('fetch') || error.message?.includes('Network') || error.message?.includes('network request failed')) {
            return {
                code: 'NETWORK_ERROR',
                message: error.message,
                userMessage: 'Connection problem. Please check your internet and try again.',
                severity: 'error',
                retryable: true
            };
        }

        // Timeout errors
        if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
            return {
                code: 'TIMEOUT_ERROR',
                message: error.message,
                userMessage: 'Request timed out. Please try again.',
                severity: 'warning',
                retryable: true
            };
        }

        // Authentication errors (401)
        if (error.response?.status === 401 || error.status === 401) {
            return {
                code: 'AUTH_ERROR',
                message: 'Unauthorized',
                userMessage: 'Your session has expired. Please log in again.',
                severity: 'error',
                retryable: false
            };
        }

        // Rate limiting (429)
        if (error.response?.status === 429 || error.status === 429) {
            return {
                code: 'RATE_LIMIT',
                message: 'Too many requests',
                userMessage: 'Too many attempts. Please wait a moment and try again.',
                severity: 'warning',
                retryable: true
            };
        }

        // Validation errors (400)
        if (error.response?.status === 400 || error.status === 400) {
            const backendMessage = error.response?.data?.message || error.response?.data?.error || error.data?.message;
            return {
                code: 'VALIDATION_ERROR',
                message: backendMessage || 'Validation failed',
                userMessage: backendMessage || 'Please check your input and try again.',
                severity: 'warning',
                retryable: false,
                details: error.response?.data || error.data
            };
        }

        // Not found errors (404)
        if (error.response?.status === 404 || error.status === 404) {
            return {
                code: 'NOT_FOUND',
                message: 'Resource not found',
                userMessage: error.response?.data?.message || 'The requested resource was not found.',
                severity: 'error',
                retryable: false
            };
        }

        // Server errors (500+)
        if ((error.response?.status && error.response.status >= 500) || (error.status && error.status >= 500)) {
            return {
                code: 'SERVER_ERROR',
                message: 'Internal server error',
                userMessage: 'Server is experiencing issues. Please try again later.',
                severity: 'error',
                retryable: true
            };
        }

        // Permission denied (403)
        if (error.response?.status === 403 || error.status === 403) {
            return {
                code: 'PERMISSION_DENIED',
                message: 'Forbidden',
                userMessage: 'You do not have permission to perform this action.',
                severity: 'error',
                retryable: false
            };
        }

        // Default error
        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'Unknown error',
            userMessage: error.message || 'Something went wrong. Please try again.',
            severity: 'error',
            retryable: true,
            details: error
        };
    }

    /**
     * Log errors for debugging
     */
    static logError(error: AppError, context?: string) {
        if (__DEV__) {
            console.error(`[${context || 'App'}] Error:`, {
                code: error.code,
                message: error.message,
                userMessage: error.userMessage,
                severity: error.severity,
                details: error.details
            });
        }

        // TODO: Send to logging service in production
        // Example: Sentry.captureException(error, context);
    }
}

/**
 * Specific error types for different features
 */
export const AuthErrors = {
    INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
    ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address to continue.',
    WEAK_PASSWORD: 'Password does not meet security requirements.',
    EMAIL_EXISTS: 'Email already registered. Please try with a different email.',
    PHONE_EXISTS: 'This phone number is already registered.',
    INVALID_OTP: 'Invalid or expired verification code. Please try again.',
    OTP_EXPIRED: 'Verification code has expired. Request a new one.',
};

export const PaymentErrors = {
    INSUFFICIENT_BALANCE: 'Insufficient balance. Please add funds to your account.',
    INVALID_PIN: 'Invalid UPI PIN. Please try again.',
    TRANSACTION_FAILED: 'Transaction failed. Your money is safe.',
    ACCOUNT_NOT_LINKED: 'Please link your bank account first.',
    INVALID_AMOUNT: 'Please enter a valid amount.',
    RECIPIENT_NOT_FOUND: 'Recipient not found. Please check the details.',
    DUPLICATE_TRANSACTION: 'This transaction may be a duplicate. Please verify.',
    DAILY_LIMIT_EXCEEDED: 'Daily transaction limit exceeded.',
};

export const MessageErrors = {
    MESSAGE_SEND_FAILED: 'Message could not be sent. Tap to retry.',
    FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
    UNSUPPORTED_FILE_TYPE: 'This file type is not supported.',
    USER_NOT_FOUND: 'User not found. Please check the username or phone number.',
    GROUP_CREATE_FAILED: 'Could not create group. Please try again.',
    FRIEND_REQUEST_FAILED: 'Could not send friend request. Please try again.',
    ALREADY_FRIENDS: 'You are already friends with this user.',
    REQUEST_ALREADY_SENT: 'Friend request already sent.',
};

export default ErrorHandler;
