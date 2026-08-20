import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Application } from "../entities/application.entity";
import { Activity } from "../entities/activity.entity";


export interface ApplicationStats {
    total: number;
    applied: number;
    interviewScheduled: number;
    interviewed: number;
    offers: number;
    rejected: number;
}

export interface AnalyticsData {
    stats: ApplicationStats;
    responseRate: number;
    averageTimeToInterview: number;
    statusDistribution: {
        [
        key: string
        ]: number
    };
    applicationTimeline: {
        date: string;
        count: number;
    }[];
    successFunnel: {
        stage: string; count: number
    }[];
}

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(Application)
        private applicationsRepository: Repository<Application>,
        @InjectRepository(Activity)
        private activitiesRepository: Repository<Activity>,
    ) { }


    async getAnalytics(
        userId: string
    ): Promise<AnalyticsData> {

        //get all applications for the user
        const applications = await this.applicationsRepository.find({
            where: { user: { id: userId } },
        });

        // Calculate stats
        const stats = this.calculateStats(applications);

        // Calculate response rate
        const responseRate = this.calculateResponseRate(applications);

        // Calculate average time to interview
        const averageTimeToInterview = await this.calculateAverageTimeToInterview(userId);

        // Status distribution
        const statusDistribution = this.calculateStatusDistribution(applications);

        // Application timeline
        const applicationTimeline = this.generateApplicationTimeline(applications);

        // Success funnel
        const successFunnel = this.calculateSuccessFunnel(applications);

        return {
            stats,
            responseRate,
            averageTimeToInterview,
            statusDistribution,
            applicationTimeline,
            successFunnel,
        };
    }


    private calculateStats(applications: Application[]): ApplicationStats {
        const stats = {
            total: applications.length,
            applied: 0,
            interviewScheduled: 0,
            interviewed: 0,
            offers: 0,
            rejected: 0,
        };

        for (const app of applications) {
            switch (app.status) {
                case 'applied':
                    stats.applied++;
                    break;
                case 'interview_scheduled':
                    stats.interviewScheduled++;
                    break;
                case 'interviewed':
                    stats.interviewed++;
                    break;
                case 'offer':
                    stats.offers++;
                    break;
                case 'rejected':
                    stats.rejected++;
                    break;
            }
        }

        return stats;
    }

    private calculateResponseRate(applications: Application[]): number {
        if (applications.length === 0) return 0;

        const responded = applications.filter(
            app => app.status !== 'applied' && app.status !== 'withdrawn'
        ).length;

        return Math.round((responded / applications.length) * 100);
    }

    private async calculateAverageTimeToInterview(userId: string): Promise<number> {
        const applications = await this.applicationsRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['activities'],
        });

        let totalDays = 0;
        let interviewCount = 0;

        for (const app of applications) {
            const activities = app.activities || [];
            const appliedActivity = activities.find(a => a.type === 'application_submitted');
            const interviewActivity = activities.find(
                a => a.type === 'interview_scheduled' || a.type === 'interview_completed'
            );

            if (appliedActivity && interviewActivity) {
                const days = Math.floor(
                    (new Date(interviewActivity.activityDate).getTime() -
                        new Date(appliedActivity.activityDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (days >= 0) {
                    totalDays += days;
                    interviewCount++;
                }
            }
        }

        return interviewCount > 0 ? Math.round(totalDays / interviewCount) : 0;
    }

    private calculateStatusDistribution(applications: Application[]): { [key: string]: number } {
        const distribution = {
            'Applied': 0,
            'Interview Scheduled': 0,
            'Interviewed': 0,
            'Offer': 0,
            'Rejected': 0,
        };

        for (const app of applications) {
            switch (app.status) {
                case 'applied':
                    distribution['Applied']++;
                    break;
                case 'interview_scheduled':
                    distribution['Interview Scheduled']++;
                    break;
                case 'interviewed':
                    distribution['Interviewed']++;
                    break;
                case 'offer':
                    distribution['Offer']++;
                    break;
                case 'rejected':
                    distribution['Rejected']++;
                    break;
            }
        }

        return distribution;
    }

    private generateApplicationTimeline(applications: Application[]): { date: string; count: number }[] {
        const timeline: { [key: string]: number } = {};

        for (const app of applications) {
            const date = new Date(app.appliedDate).toISOString().split('T')[0];
            timeline[date] = (timeline[date] || 0) + 1;
        }

        // Sort by date
        return Object.entries(timeline)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30); // Last 30 days
    }

    private calculateSuccessFunnel(applications: Application[]): { stage: string; count: number }[] {
        const stats = this.calculateStats(applications);

        return [
            { stage: 'Applied', count: stats.total },
            { stage: 'Interview Scheduled', count: stats.interviewScheduled },
            { stage: 'Interviewed', count: stats.interviewed },
            { stage: 'Offer', count: stats.offers },
        ];
    }

}
