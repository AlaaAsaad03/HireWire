import type { Application, ApplicationStats, CreateApplicationDto, UpdateApplicationDto } from '../types';
import apiClient from './axios';


export const applicationsApi = {
    getAll: async (): Promise<Application[]> => {
        const response = await apiClient.get('/applications');
        return response.data;
    },

    getOne: async (id: string): Promise<Application> => {
        const response = await apiClient.get(`/applications/${id}`);
        return response.data;
    },

    create: async (data: CreateApplicationDto): Promise<Application> => {
        const response = await apiClient.post('/applications', data);
        return response.data;
    },

    update: async (id: string, data: UpdateApplicationDto): Promise<Application> => {
        const response = await apiClient.patch(`/applications/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/applications/${id}`);
    },

    getStats: async (): Promise<ApplicationStats> => {
        const response = await apiClient.get('/applications/stats');
        return response.data;
    },
};