import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private tagsRepository: Repository<Tag>,
    ) { }

    async create(user: User, name: string, color: string = '#8b5cf6'): Promise<Tag> {
        const tag = this.tagsRepository.create({
            name,
            color,
            user,
        });
        return this.tagsRepository.save(tag);
    }

    async findAll(userId: string): Promise<Tag[]> {
        return this.tagsRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: string, name?: string, color?: string): Promise<Tag> {
        await this.tagsRepository.update(id, { name, color });

        const tag = await this.tagsRepository.findOne({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }

    async delete(id: string): Promise<void> {
        await this.tagsRepository.delete(id);
    }
}