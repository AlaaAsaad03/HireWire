import apiClient from "./axios"

export type EmailTone = "professional" | "warm" | "enthusiastic" | "concise";
export type EmailLength = "short" | "medium" | "detailed";

export interface BaseEmailRequest {
    company: string;
    position: string;
    contactName?: string;
    tone?: EmailTone;
    length?: EmailLength;
    candidateName?: string;
    highlights?: string;
    extraContext?: string;
    nextStep?: string;
    jobDescription?: string;
}

export interface FollowUpEmailRequest extends BaseEmailRequest {
    appliedDate: string;
}

export interface ThankYouEmailRequest extends BaseEmailRequest {
    interviewerName?: string;
    interviewDate: string;
    keyTopics?: string;
}

export interface GeneratedEmailResponse {
    subject: string;
    body: string;
    email: string;
    provider: "openai" | "template";
}

export const aiApi = {

    parseResume: async (resumeText: string) => {
        const response = await apiClient.post("/ai/parse-resume", { resumeText });
        return response.data;
    },

    analyzeJob: async (jobDescription: string, userSkills: string[]) => {
        const response = await apiClient.post("/ai/analyze-job", { jobDescription, userSkills });
        return response.data;
    },

    generateFollowUp: async (data: FollowUpEmailRequest): Promise<GeneratedEmailResponse> => {
        const response = await apiClient.post("/ai/generate-follow-up", data);
        return response.data;
    },

    generateThankYou: async (data: ThankYouEmailRequest): Promise<GeneratedEmailResponse> => {
        const response = await apiClient.post("/ai/generate-thank-you", data);
        return response.data;
    }
}
