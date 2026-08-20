import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ExportController {
    constructor(private applicationsService: ApplicationsService) { }

    @Get('export')
    async exportToCSV(@Request() req: any, @Res() res: Response) {
        const applications = await this.applicationsService.findAll(req.user.id);

        // Convert to CSV
        const csv = this.convertToCSV(applications);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="applications.csv"'
        );
        res.send(csv);
    }

    private convertToCSV(applications: any[]): string {
        const headers = [
            'Company',
            'Position',
            'Location',
            'Salary',
            'Applied Date',
            'Status',
            'Notes',
        ];

        const rows = applications.map((app) => [
            app.company,
            app.position,
            app.location || '',
            app.salary || '',
            app.appliedDate,
            app.status,
            app.notes || '',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) =>
                row.map((cell) => `"${cell}"`).join(',')
            ),
        ].join('\n');

        return csvContent;
    }
}