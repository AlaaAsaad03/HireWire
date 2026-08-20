import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsService } from './advanced.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(
        private analyticsService: AnalyticsService,
        private advancedAnalyticsService: AdvancedAnalyticsService,
    ) { }

    //   @Get('dashboard')
    //   async getDashboard(@Request() req: any) {
    //     return this.analyticsService.getDashboard(req.user.id);
    //   }

    // ⭐ NEW ENDPOINTS
    @Get('advanced')
    async getAdvancedAnalytics(@Request() req: any) {
        return this.advancedAnalyticsService.getAdvancedAnalytics(req.user.id);
    }

    @Get('conversion-funnel')
    async getConversionFunnel(@Request() req: any) {
        return this.advancedAnalyticsService.conversionFunnel(req.user.id);
    }

    @Get('job-titles')
    async getJobTitles(@Request() req: any) {
        return this.advancedAnalyticsService.jobTitleAnalysis(req.user.id);
    }

    @Get('locations')
    async getLocations(@Request() req: any) {
        return this.advancedAnalyticsService.locationAnalysis(req.user.id);
    }

    @Get('quality-score')
    async getQualityScore(@Request() req: any) {
        return this.advancedAnalyticsService.applicationQualityScore(req.user.id);
    }

    @Get('salary-analysis')
    async getSalaryAnalysis(@Request() req: any) {
        return this.advancedAnalyticsService.salaryMarketAnalysis(req.user.id);
    }

    @Get('momentum')
    async getMomentum(@Request() req: any) {
        return this.advancedAnalyticsService.applicationMomentum(req.user.id);
    }

    @Get('rejections')
    async getRejections(@Request() req: any) {
        return this.advancedAnalyticsService.rejectionAnalysis(req.user.id);
    }

    @Get('predictions')
    async getPredictions(@Request() req: any) {
        return this.advancedAnalyticsService.predictiveStats(req.user.id);
    }

    @Get('response-time')
    async getResponseTime(@Request() req: any) {
        return this.advancedAnalyticsService.responseTimeAnalysis(req.user.id);
    }
}