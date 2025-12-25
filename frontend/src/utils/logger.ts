/**
 * Production-safe logging utility
 * Only logs in development, sanitizes sensitive data in all environments
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === 'development';
const loggingEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';

/**
 * Sanitize sensitive data from logs
 */
const sanitizeData = (data: unknown): unknown => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sanitized = { ...data } as Record<string, unknown>;
    const sensitiveKeys = ['password', 'token', 'otp', 'otpCode', 'phoneNumber', 'email', 'phone'];

    Object.keys(sanitized).forEach(key => {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
            sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    });

    return sanitized;
};

/**
 * Log a message with proper sanitization
 */
const log = (level: LogLevel, message: string, data?: unknown) => {
    // Only log in development or if explicitly enabled
    if (!isDevelopment && !loggingEnabled) {
        return;
    }

    const timestamp = new Date().toISOString();
    const sanitizedData = data ? sanitizeData(data) : undefined;

    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
        case 'error':
            console.error(logMessage, sanitizedData);
            break;
        case 'warn':
            console.warn(logMessage, sanitizedData);
            break;
        case 'debug':
            if (isDevelopment) {
                console.debug(logMessage, sanitizedData);
            }
            break;
        default:
            console.log(logMessage, sanitizedData);
    }
};

export const logger = {
    info: (message: string, data?: unknown) => log('info', message, data),
    warn: (message: string, data?: unknown) => log('warn', message, data),
    error: (message: string, data?: unknown) => log('error', message, data),
    debug: (message: string, data?: unknown) => log('debug', message, data),
};

export default logger;
