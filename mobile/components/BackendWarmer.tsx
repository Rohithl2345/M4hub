import { useEffect } from 'react';
import { APP_CONFIG } from '@/constants';

export default function BackendWarmer() {
    useEffect(() => {
        // Fire and forget - don't wait for response
        const url = `${APP_CONFIG.API_URL}/api/health/warmup`;

        fetch(url, {
            method: 'GET'
        }).catch((err) => {
            // Ignore errors, this is just optimization
            if (__DEV__) console.log('Backend warmup signal sent (Mobile)', err);
        });
    }, []);

    return null;
}
