import { env } from '@/utils/env';

export interface TabUsageStats {
    tabName: string;
    totalDuration: number;
}

class AnalyticsService {
    private getHeaders() {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('authToken') || sessionStorage.getItem('authToken')) : null;
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    async logUsage(tabName: string, durationSeconds: number): Promise<void> {
        if (!tabName || tabName === '/') return;
        try {
            await fetch(`${env.apiUrl}/api/analytics/log`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ tabName, durationSeconds })
            });
        } catch (error) {
            console.error('Failed to log tab usage:', error);
        }
    }

    async getUsage(timeframe: string = 'weekly'): Promise<TabUsageStats[]> {
        try {
            const response = await fetch(`${env.apiUrl}/api/analytics/usage?timeframe=${timeframe}`, {
                headers: this.getHeaders()
            });
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            return [];
        }
    }
}

export default new AnalyticsService();
