import { env } from '@/utils/env';
import fetchWithAuth from '@/utils/fetchWithAuth';

export interface TabUsageStats {
    tabName: string;
    totalDuration: number;
}

export interface HubAnalyticsData {
    messageCount: number;
    transactionVolume: number;
    musicMinutes: number;
    activeUsers: number;
    trends: {
        daily: number[];
        weekly: number[];
        monthly: number[];
    };
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
            await fetchWithAuth(`${env.apiUrl}/api/analytics/log`, {
                method: 'POST',
                body: JSON.stringify({ tabName, durationSeconds })
            });
        } catch (error) {
            console.error('Failed to log tab usage:', error);
        }
    }

    async getUsage(timeframe: string = 'weekly'): Promise<TabUsageStats[]> {
        try {
            const response = await fetchWithAuth(`${env.apiUrl}/api/analytics/usage?timeframe=${timeframe}`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            return [];
        }
    }

    async getHubAnalytics(timeframe: string = 'weekly'): Promise<HubAnalyticsData | null> {
        try {
            const response = await fetchWithAuth(`${env.apiUrl}/api/analytics/hub?timeframe=${timeframe}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Failed to fetch hub analytics:', error);
            return null;
        }
    }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
