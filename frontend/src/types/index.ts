export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export type ApplicationStatus =
    | 'applied'
    | 'interview_scheduled'
    | 'interviewed'
    | 'offer'
    | 'rejected'
    | 'withdrawn';

export interface Application {
    id: string;
    company: string;
    position: string;
    appliedDate: string;
    status: ApplicationStatus;
    jobDescription?: string;
    location?: string;
    salary?: number;
    jobUrl?: string;
    notes?: string;
    interviewDate?: string;
    resumeVersion?: string;
    coverLetterText?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface ApplicationStats {
    total: number;
    applied: number;
    interviewScheduled: number;
    interviewed: number;
    offers: number;
    rejected: number;
}

export interface CreateApplicationDto {
    company: string;
    position: string;
    appliedDate: string;
    status?: ApplicationStatus;
    jobDescription?: string;
    location?: string;
    salary?: number;
    jobUrl?: string;
    notes?: string;
    interviewDate?: string;
    resumeVersion?: string;
    coverLetterText?: string;
}

export interface UpdateApplicationDto extends Partial<CreateApplicationDto> { }
