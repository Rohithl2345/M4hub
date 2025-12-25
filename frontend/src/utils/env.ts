/**
 * Environment variable validation and configuration
 */

interface EnvConfig {
    apiUrl: string;
    appEnv: 'development' | 'production' | 'test';
    enableLogging: boolean;
    appName: string;
    appVersion: string;
}

/**
 * Validate required environment variables
 */
const validateEnv = (): EnvConfig => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';
    const enableLogging = process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'M4Hub';
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

    // Validate required variables
    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL is required but not defined');
    }

    // Validate API URL format
    try {
        new URL(apiUrl);
    } catch {
        throw new Error(`Invalid NEXT_PUBLIC_API_URL: ${apiUrl}`);
    }

    // Validate environment
    if (!['development', 'production', 'test'].includes(appEnv)) {
        throw new Error(`Invalid NEXT_PUBLIC_APP_ENV: ${appEnv}. Must be development, production, or test`);
    }

    return {
        apiUrl,
        appEnv: appEnv as 'development' | 'production' | 'test',
        enableLogging,
        appName,
        appVersion,
    };
};

// Export validated config
export const env = validateEnv();

export default env;
