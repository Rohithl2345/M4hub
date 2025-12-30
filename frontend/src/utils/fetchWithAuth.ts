// API Response Interceptor for handling 401 errors globally
import { env } from '@/utils/env';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // Get token from storage
    const token = typeof window !== 'undefined'
        ? (localStorage.getItem('authToken') || sessionStorage.getItem('authToken'))
        : null;

    // Add authorization header
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Make the request
    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
        // Clear all auth data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            localStorage.removeItem('user');

            // Redirect to login
            window.location.href = '/auth/email-login?mode=login&session=expired';
        }

        throw new ApiError(401, 'Session expired. Please login again.');
    }

    return response;
}

export default fetchWithAuth;
