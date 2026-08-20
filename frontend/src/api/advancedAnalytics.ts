import apiClient from './axios';

export const advancedAnalyticsApi = {
    getAdvancedAnalytics: async () => {
        const response = await apiClient.get('/analytics/advanced');
        return response.data;
    },

    getConversionFunnel: async () => {
        const response = await apiClient.get('/analytics/conversion-funnel');
        return response.data;
    },

    getJobTitles: async () => {
        const response = await apiClient.get('/analytics/job-titles');
        return response.data;
    },

    getLocations: async () => {
        const response = await apiClient.get('/analytics/locations');
        return response.data;
    },

    getQualityScore: async () => {
        const response = await apiClient.get('/analytics/quality-score');
        return response.data;
    },

    getSalaryAnalysis: async () => {
        const response = await apiClient.get('/analytics/salary-analysis');
        return response.data;
    },

    getMomentum: async () => {
        const response = await apiClient.get('/analytics/momentum');
        return response.data;
    },

    getRejections: async () => {
        const response = await apiClient.get('/analytics/rejections');
        return response.data;
    },

    getPredictions: async () => {
        const response = await apiClient.get('/analytics/predictions');
        return response.data;
    },

    getResponseTime: async () => {
        const response = await apiClient.get('/analytics/response-time');
        return response.data;
    },
};