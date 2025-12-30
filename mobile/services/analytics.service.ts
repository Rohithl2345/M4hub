import { config } from '@/config';

export interface TabAnalytics {
    name: string;
    percentage: number;
    color: string;
    icon: string;
    sessions: number;
    totalSeconds: number;
}

export interface EngagementMetrics {
    dailyActiveTime: string;
    featuresUsed: string;
    engagementScore: string;
    dailyChange: string;
    featuresChange: string;
    scoreChange: string;
}

export interface HubAnalytics {
    tabAnalytics: TabAnalytics[];
    weeklyActivity: number[];
    engagementMetrics: EngagementMetrics;
}

export interface AnalyticsResponse {
    success: boolean;
    message: string;
    data: HubAnalytics;
}

class AnalyticsServiceClass {
    async getHubAnalytics(token: string, timeframe: string = 'weekly'): Promise<HubAnalytics | null> {
        try {
            config.log(`Fetching hub analytics (${timeframe})...`);

            const response = await fetch(`${config.apiUrl}/api/analytics/hub?timeframe=${timeframe}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                config.error(`Hub analytics failed with status: ${response.status}`);
                return null;
            }

            const data: AnalyticsResponse = await response.json();
            config.log('Hub analytics response:', data);

            if (data.success && data.data) {
                return data.data;
            }

            return null;
        } catch (error) {
            config.error('Error fetching hub analytics:', error);
            return null;
        }
    }

    async trackTabUsage(token: string, tabName: string, durationSeconds: number): Promise<boolean> {
        try {
            config.log(`Tracking ${tabName} usage: ${durationSeconds}s`);

            const response = await fetch(`${config.apiUrl}/api/analytics/log`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tabName,
                    durationSeconds,
                }),
            });

            const data = await response.json();
            return data.success === true;
        } catch (error) {
            config.log('Error tracking tab usage:', error);
            return false;
        }
    }
}

export const analyticsService = new AnalyticsServiceClass();
