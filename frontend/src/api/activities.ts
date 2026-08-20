import type { Activity, CreateActivityDto, UpdateActivityDto } from '../types';
import apiClient from './axios';


export const activitiesApi = {

    getAll: async (): Promise<Activity[]> => {
        const response = await apiClient.get('/activities');
        return response.data;
    },

    getByApplication: async (applicationId: string): Promise<Activity[]> => {
        const response = await apiClient.get(`/activities/application/${applicationId}`);
        return response.data;
    },

    getOne: async (id: string): Promise<Activity> => {
        const response = await apiClient.get(`/activities/${id}`);
        return response.data;
    },

    create: async (data: CreateActivityDto): Promise<Activity> => {
        const response = await apiClient.post('/activities', data);
        return response.data;
    },

    update: async (id: string, data: UpdateActivityDto): Promise<Activity> => {
        const response = await apiClient.patch(`/activities/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/activities/${id}`);
    },

};