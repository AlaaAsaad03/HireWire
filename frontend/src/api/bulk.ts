import apiClient from './axios';

export const bulkApi = {
    deleteMultiple: async (ids: string[]) => {
        const response = await apiClient.delete('/applications/bulk/delete', {
            data: { ids },
        });
        return response.data;
    },

    updateStatus: async (ids: string[], status: string) => {
        const response = await apiClient.patch('/applications/bulk/status', {
            ids,
            status,
        });
        return response.data;
    },

    addTag: async (ids: string[], tagId: string) => {
        const response = await apiClient.patch('/applications/bulk/tags/add', {
            ids,
            tagId,
        });
        return response.data;
    },

    removeTag: async (ids: string[], tagId: string) => {
        const response = await apiClient.patch('/applications/bulk/tags/remove', {
            ids,
            tagId,
        });
        return response.data;
    },
};