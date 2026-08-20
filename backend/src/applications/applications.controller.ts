import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BulkService } from './bulk.service';
import { ApplicationStatus } from '../entities/application.entity';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
    constructor(
        private readonly applicationsService: ApplicationsService,
        private readonly bulkService: BulkService
    ) { }

    @Post()
    create(@Body(ValidationPipe) createApplicationDto: CreateApplicationDto, @Request() req) {
        return this.applicationsService.create(createApplicationDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.applicationsService.findAll(req.user);
    }

    @Get('stats')
    getStats(@Request() req) {
        return this.applicationsService.getStats(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.applicationsService.findOne(id, req.user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateApplicationDto: UpdateApplicationDto,
        @Request() req,
    ) {
        return this.applicationsService.update(id, updateApplicationDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.applicationsService.remove(id, req.user);
    }

    @Patch(':id/tags/add')
    async addTag(
        @Param('id') id: string,
        @Body() body: { tagId: string },
    ) {
        return this.applicationsService.addTag(id, body.tagId);
    }

    @Patch(':id/tags/remove')
    async removeTag(
        @Param('id') id: string,
        @Body() body: { tagId: string },
    ) {
        return this.applicationsService.removeTag(id, body.tagId);
    }

    @Delete('bulk/delete')
    async bulkDelete(@Body() body: { ids: string[] }) {
        await this.bulkService.deleteMultiple(body.ids);
        return { success: true, message: 'Applications deleted' };
    }

    @Patch('bulk/status')
    async bulkUpdateStatus(
        @Body() body: { ids: string[]; status: string },
    ) {
        const applications = await this.bulkService.updateStatus(body.ids, body.status as ApplicationStatus);
        return applications;
    }

    @Patch('bulk/tags/add')
    async bulkAddTag(
        @Body() body: { ids: string[]; tagId: string },
    ) {
        const applications = await this.bulkService.addTagToMultiple(body.ids, body.tagId);
        return applications;
    }

    @Patch('bulk/tags/remove')
    async bulkRemoveTag(
        @Body() body: { ids: string[]; tagId: string },
    ) {
        const applications = await this.bulkService.removeTagFromMultiple(body.ids, body.tagId);
        return applications;
    }


}