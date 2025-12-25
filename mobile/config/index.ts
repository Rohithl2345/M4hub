/**
 * Configuration utilities for M4Hub mobile application
 */

import { APP_CONFIG } from '../constants';

export const config = {
    apiUrl: APP_CONFIG.API_URL,
    environment: APP_CONFIG.ENVIRONMENT,
    enableLogging: APP_CONFIG.ENABLE_LOGGING,

    isDevelopment: APP_CONFIG.ENVIRONMENT === 'development',
    isProduction: APP_CONFIG.ENVIRONMENT === 'production',

    log: (...args: any[]) => {
        if (config.enableLogging) {
            console.log('[M4Hub]', ...args);
        }
    },

    error: (...args: any[]) => {
        if (config.enableLogging) {
            console.error('[M4Hub Error]', ...args);
        }
    },

    warn: (...args: any[]) => {
        if (config.enableLogging) {
            console.warn('[M4Hub Warning]', ...args);
        }
    },
};
