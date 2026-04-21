import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

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
}