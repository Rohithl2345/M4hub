'use client';

import { useEffect } from 'react';
import { env } from '@/utils/env';

export default function BackendWarmer() {
    useEffect(() => {
        // Fire and forget - don't wait for response
        fetch(`${env.apiUrl}/api/health/warmup`, {
            method: 'GET',
            // Short timeout, we just want to trigger the connection
            signal: AbortSignal.timeout(5000)
        }).catch(() => {
            // Ignore errors, this is just optimization
            console.log('Backend warmup signal sent');
        });
    }, []);

    return null;
}
