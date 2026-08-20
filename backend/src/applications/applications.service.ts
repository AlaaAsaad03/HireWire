import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '../entities/application.entity';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from '../entities/user.entity';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Tag } from '../entities/tag.entity';
import { RemindersService } from '../reminders/reminders.service';
import { ReminderType } from '../entities/reminder.entity';

@Injectable()
export class ApplicationsService {

    constructor(
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
        @InjectRepository(Tag)
        private tagsRepository: Repository<Tag>,
        private remindersService: RemindersService,
    ) { }

    async create(createApplicationDto: CreateApplicationDto, user: User) {

        // ⭐ Convert interviewDate string to Date, or undefined if not provided
        const applicationData = {
            ...createApplicationDto,
            userId: user.id,
            interviewDate: createApplicationDto.interviewDate
                ? new Date(createApplicationDto.interviewDate)
                : undefined,  // ⭐ Use undefined, not null (TypeORM requirement)
        };

        const application = this.applicationRepository.create(applicationData);

        const savedApplication = await this.applicationRepository.save(application);

        // ⭐ AUTO-CREATE FOLLOW-UP REMINDER (7 days after application)
        try {
            await this.remindersService.createFollowUpReminder(savedApplication.id, 7);
        } catch (error) {
            console.error('Failed to create follow-up reminder:', error);
        }

        return savedApplication;
    }

    async findAll(user: User) {
        return await this.applicationRepository.find({
            where: { userId: user.id },
            relations: ['contacts', 'activities', 'reminders', 'tags'],
            order: { appliedDate: 'DESC' },
        })
    }

    async findOne(id: string, user: User) {
        const application = await this.applicationRepository.findOne({
            where: { id, userId: user.id },
            relations: ['contacts', 'activities', 'reminders', 'tags'],
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return application;
    }

    async update(id: string, updateApplicationDto: UpdateApplicationDto, user: User) {

        const application = await this.findOne(id, user);
        const previousStatus = application.status;
        const previousInterviewDate = application.interviewDate;

        // ⭐ Convert interviewDate string to Date if provided
        const updateData = {
            ...updateApplicationDto,
            interviewDate: updateApplicationDto.interviewDate
                ? new Date(updateApplicationDto.interviewDate)
                : undefined,  // ⭐ Use undefined, not null (TypeORM requirement)
        };

        Object.assign(application, updateData);

        const updatedApplication = await this.applicationRepository.save(application);

        // ⭐ AUTO-MARK FOLLOW-UP REMINDER AS COMPLETE (when interview is scheduled)
        if (updateApplicationDto.status === 'interview_scheduled' && previousStatus !== 'interview_scheduled') {
            try {
                const followUpReminder = updatedApplication.reminders?.find(r => r.type === ReminderType.FOLLOW_UP && !r.isCompleted);
                if (followUpReminder) {
                    await this.remindersService.markComplete(followUpReminder.id, user);
                }
            } catch (error) {
                console.error('Failed to mark follow-up reminder as complete:', error);
            }
        }

        // ⭐ AUTO-CREATE INTERVIEW PREP REMINDER (when interview date is set/updated)
        if (updateApplicationDto.interviewDate && !previousInterviewDate) {
            try {
                await this.remindersService.createInterviewPrepReminder(
                    updatedApplication.id,
                    new Date(updateApplicationDto.interviewDate),
                );
            } catch (error) {
                console.error('Failed to create interview prep reminder:', error);
            }
        }

        // ⭐ AUTO-CREATE THANK YOU REMINDER (when status changes to 'interviewed')
        if (updateApplicationDto.status === 'interviewed' && previousStatus !== 'interviewed') {
            try {
                await this.remindersService.createThankYouReminder(updatedApplication.id);
            } catch (error) {
                console.error('Failed to create thank you reminder:', error);
            }
        }

        return updatedApplication;
    }

    async remove(id: string, user: User) {
        const application = await this.findOne(id, user);
        await this.applicationRepository.remove(application);
        return { message: 'Application deleted successfully!' };
    }

    async getStats(user: User) {

        const applications = await this.findAll(user);

        const stats = {
            total: applications.length,
            applied: applications.filter(app => app.status === 'applied').length,
            interviewScheduled: applications.filter(app => app.status === 'interview_scheduled').length,
            interviewed: applications.filter(app => app.status === 'interviewed').length,
            offers: applications.filter(app => app.status === 'offer').length,
            rejected: applications.filter(app => app.status === 'rejected').length,
        };

        return stats;
    }

    async addTag(applicationId: string, tagId: string): Promise<Application> {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
            relations: ['tags'],
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        const tag = await this.tagsRepository.findOne({
            where: { id: tagId },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        application.tags ??= [];

        const exists = application.tags.some(t => t.id === tagId);

        if (!exists) {
            application.tags.push(tag);
            await this.applicationRepository.save(application);
        }

        return application;
    }

    async removeTag(
        applicationId: string,
        tagId: string,
    ): Promise<Application> {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
            relations: ['tags'],
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        application.tags = application.tags.filter(
            tag => tag.id !== tagId,
        );

        await this.applicationRepository.save(application);

        return application;
    }
}