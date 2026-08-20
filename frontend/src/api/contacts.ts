import type { Contact, CreateContactDto, UpdateContactDto } from '../types';
import apiClient from './axios';



export const contactsApi = {

    getAll: async (): Promise<Contact[]> => {
        const response = await apiClient.get('/contacts');
        return response.data;
    },

    getByApplication: async (applicationId: string): Promise<Contact[]> => {
        const response = await apiClient.get(`/contacts/application/${applicationId}`);
        return response.data;
    },

    getOne: async (id: string): Promise<Contact> => {
        const response = await apiClient.get(`/contacts/${id}`);
        return response.data;
    },

    create: async (data: CreateContactDto): Promise<Contact> => {
        const response = await apiClient.post('/contacts', data);
        return response.data;
    },

    update: async (id: string, data: UpdateContactDto): Promise<Contact> => {
        const response = await apiClient.patch(`/contacts/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/contacts/${id}`);
    },

    search: async (query: string): Promise<Contact[]> => {
        const response = await apiClient.get(`/contacts/search?q=${query}`);
        return response.data;
    },

};