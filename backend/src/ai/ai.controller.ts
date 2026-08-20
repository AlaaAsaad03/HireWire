import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import type { FollowUpEmailData, ThankYouEmailData } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('parse-resume')
    async parseResume(@Body('resumeText') resumeText: string) {
        return this.aiService.parseResume(resumeText);
    }

    @Post('analyze-job')
    async analyzeJob(
        @Body('jobDescription') jobDescription: string,
        @Body('userSkills') userSkills: string[],
    ) {
        return this.aiService.analyzeJobDescription(jobDescription, userSkills);
    }

    @Post('generate-follow-up')
    async generateFollowUp(@Body() data: FollowUpEmailData) {
        return this.aiService.generateFollowUpEmail(data);
    }

    @Post('generate-thank-you')
    async generateThankYou(@Body() data: ThankYouEmailData) {
        return this.aiService.generateThankYouEmail(data);
    }

    @Post('parse-job-description')
    async parseJobDescription(@Body('jobDescription') jobDescription: string) {
        return this.aiService.parseJobDescription(jobDescription);
    }
}
