import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from '../entities/activity.entity';
import { Application } from '../entities/application.entity';
import { User } from '../entities/user.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
    constructor(
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) { }

    async create(createActivityDto: CreateActivityDto, user: User) {
        // Verify the application belongs to the user
        const application = await this.applicationRepository.findOne({
            where: { id: createActivityDto.applicationId, userId: user.id },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        const activity = this.activityRepository.create({
            ...createActivityDto,
            activityDate: createActivityDto.activityDate
                ? new Date(createActivityDto.activityDate)
                : new Date(),
        });

        return await this.activityRepository.save(activity);
    }

    async findAll(user: User) {
        // Get all activities for user's applications
        const activities = await this.activityRepository
            .createQueryBuilder('activity')
            .innerJoin('activity.application', 'application')
            .where('application.userId = :userId', { userId: user.id })
            .leftJoinAndSelect('activity.application', 'app')
            .orderBy('activity.activityDate', 'DESC')
            .getMany();

        return activities;
    }

    async findByApplication(applicationId: string, user: User) {
        // Verify application belongs to user
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId, userId: user.id },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return await this.activityRepository.find({
            where: { applicationId },
            order: { activityDate: 'DESC' },
        });
    }

    async findOne(id: string, user: User) {
        const activity = await this.activityRepository
            .createQueryBuilder('activity')
            .innerJoin('activity.application', 'application')
            .where('activity.id = :id', { id })
            .andWhere('application.userId = :userId', { userId: user.id })
            .leftJoinAndSelect('activity.application', 'app')
            .getOne();

        if (!activity) {
            throw new NotFoundException('Activity not found');
        }

        return activity;
    }

    async update(id: string, updateActivityDto: UpdateActivityDto, user: User) {
        const activity = await this.findOne(id, user);

        Object.assign(activity, {
            ...updateActivityDto,
            activityDate: updateActivityDto.activityDate
                ? new Date(updateActivityDto.activityDate)
                : activity.activityDate,
        });

        return await this.activityRepository.save(activity);
    }

    async remove(id: string, user: User) {
        const activity = await this.findOne(id, user);
        await this.activityRepository.remove(activity);
        return { message: 'Activity deleted successfully' };
    }

    // Auto-create activity when application status changes
    async createStatusChangeActivity(applicationId: string, oldStatus: string, newStatus: string) {
        const activity = this.activityRepository.create({
            type: ActivityType.STATUS_CHANGED,
            title: `Status changed to ${newStatus}`,
            description: `Status changed from ${oldStatus} to ${newStatus}`,
            applicationId,
            activityDate: new Date(),
        });

        return await this.activityRepository.save(activity);
    }
}