import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reminder, ReminderType } from '../entities/reminder.entity';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { User } from '../entities/user.entity';
import { NotFoundError } from 'rxjs';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {


    constructor(
        @InjectRepository(Reminder)
        private reminderRepository: Repository<Reminder>,

        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) { }

    async create(createReminderDto: CreateReminderDto, user: User) {

        // Verify application belongs to user
        const application = await this.applicationRepository.findOne({
            where: {
                id: createReminderDto.applicationId,
                userId: user.id,
            }
        })

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        const reminder = this.reminderRepository.create({
            ...createReminderDto,
            reminderDate: new Date(createReminderDto.reminderDate),
        });

        return this.reminderRepository.save(reminder);
    }

    async findAll(user: User) {

        const reminders = await this.reminderRepository
            .createQueryBuilder('reminder')
            .innerJoin('reminder.application', 'application')
            .where('application.userId = :userId', { userId: user.id })
            .leftJoinAndSelect('reminder.application', 'app')
            .orderBy('reminder.reminderDate', 'ASC')
            .getMany();

        return reminders;
    }

    async findPending(user: User) {
        const now = new Date();
        const reminders = await this.reminderRepository
            .createQueryBuilder('reminder')
            .innerJoin('reminder.application', 'application')
            .where('application.userId = :userId', { userId: user.id })
            .andWhere('reminder.reminderDate > :now', { now })
            .leftJoinAndSelect('reminder.application', 'app')
            .orderBy('reminder.reminderDate', 'ASC')
            .getMany();

        return reminders;
    }

    async findByApplication(applicationId: string, user: User) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId, userId: user.id },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return this.reminderRepository.find({
            where: { applicationId },
            order: { reminderDate: 'ASC' },
        });
    }

    async findOne(id: string, user: User) {
        const reminder = await this.reminderRepository
            .createQueryBuilder('reminder')
            .innerJoin('reminder.application', 'application')
            .where('reminder.id = :id', { id })
            .andWhere('application.userId = :userId', { userId: user.id })
            .leftJoinAndSelect('reminder.application', 'app')
            .getOne();

        if (!reminder) {
            throw new NotFoundException('Reminder not found');
        }

        return reminder;
    }

    async update(id: string, updateReminderDto: UpdateReminderDto, user: User) {
        const reminder = await this.findOne(id, user);

        Object.assign(reminder, {
            ...updateReminderDto,
            reminderDate: updateReminderDto.reminderDate
                ? new Date(updateReminderDto.reminderDate)
                : reminder.reminderDate,
            completedAt: updateReminderDto.isCompleted && !reminder.isCompleted
                ? new Date()
                : reminder.completedAt,
        });

        return await this.reminderRepository.save(reminder);
    }

    async markComplete(id: string, user: User) {
        const reminder = await this.findOne(id, user);
        reminder.isCompleted = true;
        reminder.completedAt = new Date();
        return await this.reminderRepository.save(reminder);
    }

    async remove(id: string, user: User) {
        const reminder = await this.findOne(id, user);
        await this.reminderRepository.remove(reminder);
        return { message: 'Reminder deleted successfully' };
    }

    // Auto-create follow-up reminder when application is created
    async createFollowUpReminder(applicationId: string, daysAfter: number = 7) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + daysAfter);

        const reminder = this.reminderRepository.create({
            type: ReminderType.FOLLOW_UP,
            title: `Follow up with ${application.company}`,
            description: `It's been ${daysAfter} days since you applied to ${application.company} for the ${application.position} role. If you haven't heard back, it's a great time to send a thoughtful follow-up email!`,
            reminderDate: followUpDate,
            applicationId,
        });

        return this.reminderRepository.save(reminder);
    }

    // AUTO-CREATE INTERVIEW PREP REMINDER WITH CONTEXTUAL MESSAGE
    async createInterviewPrepReminder(applicationId: string, interviewDate: Date) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        const reminderDate = new Date(interviewDate);
        reminderDate.setDate(reminderDate.getDate() - 1); // Day before

        const interviewDateFormatted = interviewDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });

        const reminder = this.reminderRepository.create({
            type: ReminderType.INTERVIEW_PREP,
            title: `Prepare for interview at ${application.company}`,
            description: `Your interview at ${application.company} for the ${application.position} position is tomorrow (${interviewDateFormatted}). Review your notes, research the company, prepare your answers to common questions, and practice your talking points!`,
            reminderDate,
            applicationId,
        });

        return await this.reminderRepository.save(reminder);
    }

    //  AUTO-CREATE THANK YOU REMINDER WITH CONTEXTUAL MESSAGE
    async createThankYouReminder(applicationId: string) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        const reminderDate = new Date();
        reminderDate.setHours(reminderDate.getHours() + 2); // 2 hours after

        const reminder = this.reminderRepository.create({
            type: ReminderType.THANK_YOU,
            title: `Send thank you email to ${application.company}`,
            description: `Great job on your interview at ${application.company} for the ${application.position} role! Send a personalized thank you email to your interviewer(s) within the next few hours to reinforce your interest and stand out from other candidates.`,
            reminderDate,
            applicationId,
        });

        return await this.reminderRepository.save(reminder);
    }
}


