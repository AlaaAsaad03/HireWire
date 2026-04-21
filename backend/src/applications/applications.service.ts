import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from '../entities/application.entity';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from '../entities/user.entity';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {


    constructor(
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) { }

    async create(createApplicationDto: CreateApplicationDto, user: User) {

        const application = this.applicationRepository.create({
            ...createApplicationDto,
            userId: user.id,
        });

        return await this.applicationRepository.save(application);
    }

    async findAll(user: User) {
        return await this.applicationRepository.find({
            where: { userId: user.id },
            order: { appliedDate: 'DESC' },
        })
    }

    async findOne(id: string, user: User) {
        const application = await this.applicationRepository.findOne({
            where: { id, userId: user.id },
            relations: ['contacts'],
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return application;
    }

    async update(id: string, updateApplicationDto: UpdateApplicationDto, user: User) {

        const application = await this.findOne(id, user);

        Object.assign(application, updateApplicationDto);

        return await this.applicationRepository.save(application);
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


}
