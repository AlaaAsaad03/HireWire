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
    contacts?: Contact[];
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

    tags?: {
        id: string;
        name: string;
        color: string;
    }[];
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


export type ContactRole = 'recruiter' | 'hiring_manager' | 'hr' | 'team_member' | 'other';

export interface Contact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: ContactRole;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    applicationId: string;
    application?: Application;
}

export interface CreateContactDto {
    name: string;
    email?: string;
    phone?: string;
    role: ContactRole;
    notes?: string;
    applicationId: string;
}

export interface UpdateContactDto extends Partial<Omit<CreateContactDto, 'applicationId'>> { }

export type ActivityType =
    | 'application_submitted'
    | 'email_received'
    | 'email_sent'
    | 'phone_call_received'
    | 'phone_call_made'
    | 'interview_scheduled'
    | 'interview_completed'
    | 'follow_up_sent'
    | 'status_changed'
    | 'note_added'
    | 'other';

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    description?: string;
    activityDate: string;
    createdAt: string;
    applicationId: string;
    application?: Application;
}

export interface CreateActivityDto {
    type: ActivityType;
    title: string;
    description?: string;
    activityDate?: string;
    applicationId: string;
}

export interface UpdateActivityDto extends Partial<Omit<CreateActivityDto, 'applicationId'>> { }

export type ReminderType = 'follow_up' | 'interview_prep' | 'thank_you' | 'custom';

export interface Reminder {
    id: string;
    type: ReminderType;
    title: string;
    description?: string;
    reminderDate: string;
    isCompleted: boolean;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    applicationId: string;
    application?: Application;
}

export interface CreateReminderDto {
    type: ReminderType;
    title: string;
    description?: string;
    reminderDate: string;
    applicationId: string;
}

export interface UpdateReminderDto extends Partial<Omit<CreateReminderDto, 'applicationId'>> {
    isCompleted?: boolean;
}

export interface AdvancedAnalyticsData {
    conversionRate: number;
    averageTimeToOffer: number;
    interviewsByMonth: { month: string; count: number }[];
    stats: {
        offers: number;
    };
    topCompanies: { company: string; count: number }[];
    applicationsByLocation: { location: string; count: number }[];
    topPositions: { position: string; count: number }[];
}

