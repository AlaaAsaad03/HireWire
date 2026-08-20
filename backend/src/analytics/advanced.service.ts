import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';

@Injectable()
export class AdvancedAnalyticsService {
    constructor(
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) { }

    // ⭐ OVERVIEW ENDPOINT
    async getAdvancedAnalytics(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
            relations: ['activities'],
        });

        const totalApplied = apps.length;
        const totalInterviews = apps.filter((a) => a.status === 'interview_scheduled' || a.status === 'interviewed' || a.status === 'offer').length;
        const conversionRate = totalApplied > 0 ? Math.round((totalInterviews / totalApplied) * 100) : 0;

        let totalOfferTime = 0;
        let offerCount = 0;
        let totalOffers = 0;

        const monthsMap = new Map<string, number>();
        const companiesMap = new Map<string, number>();
        const locationsMap = new Map<string, number>();
        const positionsMap = new Map<string, number>();

        apps.forEach((app) => {
            if (app.status === 'offer') totalOffers++;

            // Company
            companiesMap.set(app.company, (companiesMap.get(app.company) || 0) + 1);

            // Location
            if (app.location) {
                locationsMap.set(app.location, (locationsMap.get(app.location) || 0) + 1);
            }

            // Position
            positionsMap.set(app.position, (positionsMap.get(app.position) || 0) + 1);

            // Interviews By Month
            if (app.status === 'interview_scheduled' || app.status === 'interviewed' || app.status === 'offer') {
                const date = new Date(app.interviewDate || app.appliedDate);
                const month = date.toLocaleString('default', { month: 'short' });
                monthsMap.set(month, (monthsMap.get(month) || 0) + 1);
            }

            // Time to offer
            if (app.status === 'offer') {
                const activities = app.activities || [];
                const appliedActivity = activities.find(a => a.type === 'application_submitted');
                const offerActivity = activities.find(a => a.type === 'status_changed' && a.title.toLowerCase().includes('offer'));

                if (appliedActivity && offerActivity) {
                    const days = Math.floor(
                        (new Date(offerActivity.createdAt).getTime() - new Date(appliedActivity.createdAt).getTime()) / 86400000
                    );
                    if (days >= 0) {
                        totalOfferTime += days;
                        offerCount++;
                    }
                } else {
                    const days = Math.floor(
                        (new Date(app.updatedAt).getTime() - new Date(app.appliedDate).getTime()) / 86400000
                    );
                    if (days >= 0) {
                        totalOfferTime += days;
                        offerCount++;
                    }
                }
            }
        });

        const averageTimeToOffer = offerCount > 0 ? Math.round(totalOfferTime / offerCount) : 0;

        const interviewsByMonth = Array.from(monthsMap.entries()).map(([month, count]) => ({ month, count }));
        const topCompanies = Array.from(companiesMap.entries())
            .map(([company, count]) => ({ company, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const applicationsByLocation = Array.from(locationsMap.entries())
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topPositions = Array.from(positionsMap.entries())
            .map(([position, count]) => ({ position, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            conversionRate,
            averageTimeToOffer,
            interviewsByMonth,
            stats: {
                offers: totalOffers,
            },
            topCompanies,
            applicationsByLocation,
            topPositions,
        };
    }

    // ⭐ CONVERSION FUNNEL (Most Important!)
    async conversionFunnel(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        const stages = {
            applied: 0,
            interview_scheduled: 0,
            interviewed: 0,
            offer: 0,
            accepted: 0,
        };

        apps.forEach((app) => {
            stages.applied += 1;
            if (app.status !== 'applied' && app.status !== 'rejected' && app.status !== 'withdrawn') {
                stages.interview_scheduled += 1;
            }
            if (app.status === 'interviewed' || app.status === 'offer') {
                stages.interviewed += 1;
            }
            if (app.status === 'offer') {
                stages.offer += 1;
            }
            if (app.status === 'offer') {
                stages.accepted += 1;
            }
        });

        const total = stages.applied;

        return [
            {
                stage: 'Applied',
                count: stages.applied,
                percentage: 100,
                conversionFromPrevious: null,
            },
            {
                stage: 'Interview Scheduled',
                count: stages.interview_scheduled,
                percentage: Math.round((stages.interview_scheduled / total) * 100),
                conversionFromPrevious: Math.round(
                    (stages.interview_scheduled / stages.applied) * 100,
                ),
            },
            {
                stage: 'Interviewed',
                count: stages.interviewed,
                percentage: Math.round((stages.interviewed / total) * 100),
                conversionFromPrevious:
                    stages.interview_scheduled > 0
                        ? Math.round((stages.interviewed / stages.interview_scheduled) * 100)
                        : 0,
            },
            {
                stage: 'Offer',
                count: stages.offer,
                percentage: Math.round((stages.offer / total) * 100),
                conversionFromPrevious:
                    stages.interviewed > 0 ? Math.round((stages.offer / stages.interviewed) * 100) : 0,
            },
        ];
    }

    // ⭐ JOB TITLE ANALYSIS
    async jobTitleAnalysis(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        const titles = new Map<string, { count: number; interviews: number; offers: number }>();

        apps.forEach((app) => {
            const title = app.position;
            if (!titles.has(title)) {
                titles.set(title, { count: 0, interviews: 0, offers: 0 });
            }

            const stats = titles.get(title)!;
            stats.count += 1;

            if (app.status === 'interviewed' || app.status === 'interview_scheduled') {
                stats.interviews += 1;
            }
            if (app.status === 'offer') {
                stats.offers += 1;
            }
        });

        return Array.from(titles.entries())
            .map(([title, stats]) => ({
                title,
                applications: stats.count,
                interviews: stats.interviews,
                offers: stats.offers,
                interviewRate: Math.round((stats.interviews / stats.count) * 100),
                offerRate: Math.round((stats.offers / stats.count) * 100),
            }))
            .sort((a, b) => b.applications - a.applications)
            .slice(0, 15);
    }

    // ⭐ LOCATION ANALYSIS
    async locationAnalysis(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        const locations = new Map<string, { count: number; interviews: number; offers: number }>();

        apps.forEach((app) => {
            const location = app.location || 'Unknown';
            if (!locations.has(location)) {
                locations.set(location, { count: 0, interviews: 0, offers: 0 });
            }

            const stats = locations.get(location)!;
            stats.count += 1;

            if (app.status === 'interviewed' || app.status === 'interview_scheduled') {
                stats.interviews += 1;
            }
            if (app.status === 'offer') {
                stats.offers += 1;
            }
        });

        return Array.from(locations.entries())
            .map(([location, stats]) => ({
                location,
                applications: stats.count,
                interviews: stats.interviews,
                offers: stats.offers,
                successRate: Math.round(((stats.interviews + stats.offers) / stats.count) * 100),
            }))
            .sort((a, b) => b.applications - a.applications)
            .slice(0, 10);
    }

    // ⭐ APPLICATION QUALITY SCORE
    async applicationQualityScore(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        if (apps.length === 0) {
            return {
                score: 0,
                feedback: 'No applications yet',
                recommendations: [],
            };
        }

        // Calculate various metrics
        const totalApps = apps.length;
        const applicationsWithNotes = apps.filter((a) => a.notes && a.notes.length > 0).length;
        const applicationsWithUrl = apps.filter((a) => a.jobUrl && a.jobUrl.length > 0).length;
        const applicationsWithResume = apps.filter(
            (a) => a.resumeVersion && a.resumeVersion.length > 0,
        ).length;
        const interviewRate =
            apps.filter((a) => a.status === 'interviewed' || a.status === 'interview_scheduled').length /
            totalApps;
        const recentApps = apps.filter((a) => {
            const date = new Date(a.appliedDate);
            const daysAgo = Math.floor((Date.now() - date.getTime()) / 86400000);
            return daysAgo <= 30;
        }).length;

        // Score calculation (0-100)
        let score = 50; // Base score
        score += (applicationsWithNotes / totalApps) * 15; // Notes quality
        score += (applicationsWithUrl / totalApps) * 10; // Job URL tracking
        score += (applicationsWithResume / totalApps) * 10; // Resume tracking
        score += Math.min(interviewRate * 100, 15); // Interview success

        const recommendations: string[] = [];

        if (applicationsWithNotes / totalApps < 0.6) {
            recommendations.push('Add notes to more applications - track your progress and insights');
        }
        if (applicationsWithUrl / totalApps < 0.7) {
            recommendations.push('Save job posting URLs - helps with follow-ups and reference');
        }
        if (applicationsWithResume / totalApps < 0.7) {
            recommendations.push('Track which resume version you used - optimize versions that work');
        }
        if (recentApps === 0) {
            recommendations.push('Apply to more positions - consistency is key to success');
        }
        if (interviewRate < 0.15) {
            recommendations.push('Improve your applications - low interview rate suggests refinement needed');
        }

        return {
            score: Math.round(score),
            feedback:
                score >= 80
                    ? 'Excellent application quality!'
                    : score >= 60
                        ? 'Good tracking, but could improve'
                        : 'Need to focus on quality metrics',
            recommendations,
            metrics: {
                notesCompletion: Math.round((applicationsWithNotes / totalApps) * 100),
                urlCompletion: Math.round((applicationsWithUrl / totalApps) * 100),
                resumeCompletion: Math.round((applicationsWithResume / totalApps) * 100),
                interviewRate: Math.round(interviewRate * 100),
            },
        };
    }

    // ⭐ SALARY ANALYSIS BY ROLE & LOCATION
    async salaryMarketAnalysis(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        // By role
        const salaryByRole = new Map<string, number[]>();
        apps.forEach((app) => {
            if (app.salary && app.salary > 0) {
                const title = app.position;
                if (!salaryByRole.has(title)) {
                    salaryByRole.set(title, []);
                }
                salaryByRole.get(title)!.push(app.salary);
            }
        });

        const roleAnalysis = Array.from(salaryByRole.entries())
            .map(([role, salaries]) => ({
                role,
                count: salaries.length,
                average: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
                min: Math.min(...salaries),
                max: Math.max(...salaries),
                median: salaries.sort((a, b) => a - b)[Math.floor(salaries.length / 2)],
            }))
            .filter((r) => r.count >= 2)
            .sort((a, b) => b.average - a.average)
            .slice(0, 10);

        return {
            byRole: roleAnalysis,
            totalDataPoints: apps.filter((a) => a.salary && a.salary > 0).length,
        };
    }

    // ⭐ APPLICATION MOMENTUM (Last 30/60/90 days)
    async applicationMomentum(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        const now = new Date();
        const periods = {
            last7days: { count: 0, interviews: 0 },
            last30days: { count: 0, interviews: 0 },
            last60days: { count: 0, interviews: 0 },
            last90days: { count: 0, interviews: 0 },
        };

        apps.forEach((app) => {
            const date = new Date(app.appliedDate);
            const daysAgo = Math.floor((now.getTime() - date.getTime()) / 86400000);

            if (daysAgo <= 7) {
                periods.last7days.count += 1;
                if (app.status === 'interviewed' || app.status === 'interview_scheduled')
                    periods.last7days.interviews += 1;
            }
            if (daysAgo <= 30) {
                periods.last30days.count += 1;
                if (app.status === 'interviewed' || app.status === 'interview_scheduled')
                    periods.last30days.interviews += 1;
            }
            if (daysAgo <= 60) {
                periods.last60days.count += 1;
                if (app.status === 'interviewed' || app.status === 'interview_scheduled')
                    periods.last60days.interviews += 1;
            }
            if (daysAgo <= 90) {
                periods.last90days.count += 1;
                if (app.status === 'interviewed' || app.status === 'interview_scheduled')
                    periods.last90days.interviews += 1;
            }
        });

        return {
            last7days: {
                ...periods.last7days,
                interviewRate:
                    periods.last7days.count > 0
                        ? Math.round((periods.last7days.interviews / periods.last7days.count) * 100)
                        : 0,
            },
            last30days: {
                ...periods.last30days,
                interviewRate:
                    periods.last30days.count > 0
                        ? Math.round((periods.last30days.interviews / periods.last30days.count) * 100)
                        : 0,
            },
            last60days: {
                ...periods.last60days,
                interviewRate:
                    periods.last60days.count > 0
                        ? Math.round((periods.last60days.interviews / periods.last60days.count) * 100)
                        : 0,
            },
            last90days: {
                ...periods.last90days,
                interviewRate:
                    periods.last90days.count > 0
                        ? Math.round((periods.last90days.interviews / periods.last90days.count) * 100)
                        : 0,
            },
        };
    }

    // ⭐ REJECTION ANALYSIS
    async rejectionAnalysis(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        const rejected = apps.filter((a) => a.status === 'rejected');
        const withdrawn = apps.filter((a) => a.status === 'withdrawn');
        const total = apps.length;

        const rejectionRate = Math.round((rejected.length / total) * 100);
        const withdrawalRate = Math.round((withdrawn.length / total) * 100);

        return {
            totalApplications: total,
            rejected: rejected.length,
            withdrawn: withdrawn.length,
            rejectionRate,
            withdrawalRate,
            remaining: total - rejected.length - withdrawn.length,
            insight:
                rejectionRate > 50
                    ? 'High rejection rate - consider improving applications or targeting different roles'
                    : rejectionRate > 30
                        ? 'Moderate rejection rate - analyze feedback to improve'
                        : 'Low rejection rate - keep up the good work!',
        };
    }

    // ⭐ PREDICTIVE STATS
    async predictiveStats(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
        });

        const now = new Date();
        const last30days = apps.filter((a) => {
            const date = new Date(a.appliedDate);
            const daysAgo = Math.floor((now.getTime() - date.getTime()) / 86400000);
            return daysAgo <= 30;
        });

        const last30DaysInterviews = last30days.filter(
            (a) => a.status === 'interviewed' || a.status === 'interview_scheduled',
        ).length;
        const last30DaysOffers = last30days.filter((a) => a.status === 'offer').length;

        const interviewRate =
            last30days.length > 0 ? last30DaysInterviews / last30days.length : 0;
        const offerRate = last30DaysInterviews > 0 ? last30DaysOffers / last30DaysInterviews : 0;

        // Project next 90 days
        const expectedApplications = Math.round((last30days.length / 30) * 90);
        const expectedInterviews = Math.round(expectedApplications * interviewRate);
        const expectedOffers = Math.round(expectedInterviews * offerRate);

        return {
            last30days: {
                applications: last30days.length,
                interviews: last30DaysInterviews,
                offers: last30DaysOffers,
            },
            projected90days: {
                applications: expectedApplications,
                interviews: expectedInterviews,
                offers: expectedOffers,
                message:
                    expectedOffers > 0
                        ? `If you maintain this pace, expect ~${expectedOffers} offer(s) in the next 90 days`
                        : 'Increase applications to improve offer projections',
            },
        };
    }

    // ⭐ RESPONSE TIME ANALYSIS
    async responseTimeAnalysis(userId: string) {
        const apps = await this.applicationRepository.find({
            where: { user: { id: userId } },
            relations: ['activities'],
        });

        const responseTimes: number[] = [];

        apps.forEach((app) => {
            if (
                (app.status === 'interview_scheduled' || app.status === 'interviewed') &&
                app.activities &&
                app.activities.length > 0
            ) {
                const appliedDate = new Date(app.appliedDate);
                const firstActivity = app.activities[0];
                const activityDate = new Date(firstActivity.createdAt);
                const daysToResponse = Math.floor(
                    (activityDate.getTime() - appliedDate.getTime()) / 86400000,
                );
                if (daysToResponse >= 0) {
                    responseTimes.push(daysToResponse);
                }
            }
        });

        if (responseTimes.length === 0) {
            return {
                average: 0,
                median: 0,
                fastest: 0,
                slowest: 0,
                dataPoints: 0,
                message: 'Apply and get responses to see response time analytics',
            };
        }

        responseTimes.sort((a, b) => a - b);

        return {
            average: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
            median: responseTimes[Math.floor(responseTimes.length / 2)],
            fastest: responseTimes[0],
            slowest: responseTimes[responseTimes.length - 1],
            dataPoints: responseTimes.length,
            message:
                responseTimes[0] < 3
                    ? 'Great! Companies are responding quickly to your applications'
                    : 'Companies typically take a few days to respond',
        };
    }

    private estimateCompanySize(companyName: string): 'startup' | 'small-medium' | 'enterprise' {
        const enterprise = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'tesla', 'netflix'];
        if (enterprise.some((name) => companyName.toLowerCase().includes(name))) {
            return 'enterprise';
        }
        return 'small-medium';
    }
}