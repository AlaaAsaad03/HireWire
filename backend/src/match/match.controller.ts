import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MatchService } from './match.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('match')
@UseGuards(JwtAuthGuard)
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
        private readonly authService: AuthService,
    ) { }

    // Get user's skills
    @Get('user-skills')
    async getUserSkills(@Request() req: any) {
        const user = await this.authService.getUserById(req.user.id);
        return { skills: user.skills || [] };
    }

    // Update user skills
    @Post('user-skills')
    async updateUserSkills(
        @Request() req: any,
        @Body() body: { skills: string[] },
    ) {
        const user = await this.authService.updateUserSkills(req.user.id, body.skills || []);
        return { skills: user.skills };
    }

    // Calculate match for a job description
    @Post('calculate')
    async calculateMatch(
        @Request() req: any,
        @Body() body: { jobDescription: string },
    ) {
        const user = await this.authService.getUserById(req.user.id);
        const userSkills = user.skills || [];

        // Extract job skills from description
        const jobSkills = this.matchService.extractJobSkills(body.jobDescription);

        // Calculate match
        const result = this.matchService.calculateMatch(userSkills, jobSkills);

        return result;
    }
}