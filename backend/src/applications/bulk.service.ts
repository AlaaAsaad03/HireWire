import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/application.entity';

@Injectable()
export class BulkService {
    constructor(
        @InjectRepository(Application)
        private applicationsRepository: Repository<Application>,
    ) { }

    async deleteMultiple(applicationIds: string[]): Promise<void> {
        await this.applicationsRepository.delete({
            id: In(applicationIds),
        });
    }

    async updateStatus(
        applicationIds: string[],
        status: ApplicationStatus,
    ): Promise<Application[]> {
        await this.applicationsRepository.update(
            { id: In(applicationIds) },
            { status },
        );

        return this.applicationsRepository.find({
            where: { id: In(applicationIds) },
        });
    }

    async addTagToMultiple(
        applicationIds: string[],
        tagId: string,
    ): Promise<Application[]> {
        const applications = await this.applicationsRepository.find({
            where: { id: In(applicationIds) },
            relations: ['tags'],
        });

        for (const app of applications) {
            if (!app.tags) app.tags = [];
            if (!app.tags.find(t => t.id === tagId)) {
                // This requires Tag entity to be loaded
                await this.applicationsRepository
                    .createQueryBuilder()
                    .relation(Application, 'tags')
                    .of(app)
                    .add(tagId);
            }
        }

        return this.applicationsRepository.find({
            where: { id: In(applicationIds) },
            relations: ['tags'],
        });
    }

    async removeTagFromMultiple(
        applicationIds: string[],
        tagId: string,
    ): Promise<Application[]> {
        for (const appId of applicationIds) {
            await this.applicationsRepository
                .createQueryBuilder()
                .relation(Application, 'tags')
                .of(appId)
                .remove(tagId);
        }

        return this.applicationsRepository.find({
            where: { id: In(applicationIds) },
            relations: ['tags'],
        });
    }
}