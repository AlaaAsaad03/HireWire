import apiClient from './axios';

export interface AnalyticsData {
    stats: {
        total: number;
        applied: number;
        interviewScheduled: number;
        interviewed: number;
        offers: number;
        rejected: number;
    };
    responseRate: number;
    averageTimeToInterview: number;
    statusDistribution: { [key: string]: number };
    applicationTimeline: { date: string; count: number }[];
    successFunnel: { stage: string; count: number }[];
}

export const analyticsApi = {
    getAnalytics: async (): Promise<AnalyticsData> => {
        const response = await apiClient.get('/analytics');
        return response.data;
    },
};