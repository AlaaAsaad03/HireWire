import apiClient from './axios';

export interface Tag {
    id: string;
    name: string;
    color: string;
    createdAt?: string;
}

export const tagsApi = {
    getAll: async (): Promise<Tag[]> => {
        const response = await apiClient.get('/tags');
        return response.data;
    },

    create: async (name: string, color: string = '#8b5cf6'): Promise<Tag> => {
        const response = await apiClient.post('/tags', { name, color });
        return response.data;
    },

    update: async (id: string, name?: string, color?: string): Promise<Tag> => {
        const response = await apiClient.patch(`/tags/${id}`, { name, color });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/tags/${id}`);
    },

    addToApplication: async (applicationId: string, tagId: string) => {
        const response = await apiClient.patch(`/applications/${applicationId}/tags/add`, { tagId });
        return response.data;
    },

    removeFromApplication: async (applicationId: string, tagId: string) => {
        const response = await apiClient.patch(`/applications/${applicationId}/tags/remove`, { tagId });
        return response.data;
    },
};