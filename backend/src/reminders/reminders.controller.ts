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
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) { }

    @Post()
    create(@Body(ValidationPipe) createReminderDto: CreateReminderDto, @Request() req) {
        return this.remindersService.create(createReminderDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.remindersService.findAll(req.user);
    }

    @Get('pending')
    findPending(@Request() req) {
        return this.remindersService.findPending(req.user);
    }

    @Get('application/:applicationId')
    findByApplication(@Param('applicationId') applicationId: string, @Request() req) {
        return this.remindersService.findByApplication(applicationId, req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.remindersService.findOne(id, req.user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateReminderDto: UpdateReminderDto,
        @Request() req,
    ) {
        return this.remindersService.update(id, updateReminderDto, req.user);
    }

    @Patch(':id/complete')
    markComplete(@Param('id') id: string, @Request() req) {
        return this.remindersService.markComplete(id, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.remindersService.remove(id, req.user);
    }
}