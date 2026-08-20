import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ValidationPipe
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @Post()
    create(@Body(ValidationPipe) createActivityDto: CreateActivityDto, @Request() req) {
        return this.activitiesService.create(createActivityDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.activitiesService.findAll(req.user);
    }

    @Get('application/:applicationId')
    findByApplication(@Param('applicationId') applicationId: string, @Request() req) {
        return this.activitiesService.findByApplication(applicationId, req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.activitiesService.findOne(id, req.user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateActivityDto: UpdateActivityDto,
        @Request() req,
    ) {
        return this.activitiesService.update(id, updateActivityDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.activitiesService.remove(id, req.user);
    }
}