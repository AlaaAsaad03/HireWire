import apiClient from './axios';

export const settingsApi = {
    // Get profile
    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    // Update profile
    updateProfile: async (firstName: string, lastName: string) => {
        const response = await apiClient.patch('/auth/profile', {
            firstName,
            lastName,
        });
        return response.data;
    },

    // Change password
    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await apiClient.patch('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    // Delete account
    deleteAccount: async () => {
        const response = await apiClient.delete('/auth/account');
        return response.data;
    },

    // Export data (applications)
    exportData: async () => {
        const response = await apiClient.get('/applications/export', {
            responseType: 'blob',
        });
        return response.data;
    },
};