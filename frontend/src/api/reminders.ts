import type { CreateReminderDto, Reminder, UpdateReminderDto } from '../types';
import apiClient from './axios';

export const remindersApi = {
    getAll: async (): Promise<Reminder[]> => {
        const response = await apiClient.get('/reminders');
        return response.data;
    },

    getPending: async (): Promise<Reminder[]> => {
        const response = await apiClient.get('/reminders/pending');
        return response.data;
    },

    getByApplication: async (applicationId: string): Promise<Reminder[]> => {
        const response = await apiClient.get(`/reminders/application/${applicationId}`);
        return response.data;
    },

    getOne: async (id: string): Promise<Reminder> => {
        const response = await apiClient.get(`/reminders/${id}`);
        return response.data;
    },

    create: async (data: CreateReminderDto): Promise<Reminder> => {
        const response = await apiClient.post('/reminders', data);
        return response.data;
    },

    update: async (id: string, data: UpdateReminderDto): Promise<Reminder> => {
        const response = await apiClient.patch(`/reminders/${id}`, data);
        return response.data;
    },

    markComplete: async (id: string): Promise<Reminder> => {
        const response = await apiClient.patch(`/reminders/${id}/complete`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/reminders/${id}`);
    },
};