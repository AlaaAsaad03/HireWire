import apiClient from './axios';

export const matchApi = {
    getUserSkills: async () => {
        const response = await apiClient.get('/match/user-skills');
        return response.data;
    },

    updateUserSkills: async (skills: string[]) => {
        const response = await apiClient.post('/match/user-skills', { skills });
        return response.data;
    },

    calculateMatch: async (jobDescription: string) => {
        const response = await apiClient.post('/match/calculate', { jobDescription });
        return response.data;
    },
};