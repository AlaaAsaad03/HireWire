import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from '../entities/contact.entity';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { User } from '../entities/user.entity';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {

    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) { }


    async create(createContactDto: CreateContactDto, user: User) {
        // Verify the application belongs to the user
        const application = await this.applicationRepository.findOne({
            where: { id: createContactDto.applicationId, userId: user.id },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        const contact = this.contactRepository.create(createContactDto);
        return await this.contactRepository.save(contact);
    }

    async findAll(user: User) {

        //Get All contacts for user's applications
        const contacts = await this.contactRepository
            .createQueryBuilder('contact')
            .innerJoin('contact.application', 'application')
            .where('application.userId = :userId', { userId: user.id })
            .leftJoinAndSelect('contact.application', 'app')
            .orderBy('contact.createdAt', 'DESC')
            .getMany();

        return contacts;
    }

    async findByApplication(applicationId: string, user: User) {

        // Verify the application belongs to the user
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId, userId: user.id },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        return await this.contactRepository.find({
            where: { applicationId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, user: User) {
        const contact = await this.contactRepository
            .createQueryBuilder('contact')
            .innerJoin('contact.application', 'application')
            .where('contact.id = :id', { id })
            .andWhere('application.userId = :userId', { userId: user.id })
            .leftJoinAndSelect('contact.application', 'app')
            .getOne();

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        return contact;
    }

    async search(query: string, user: User) {

        // Search by name, email, or phone 
        const contacts = await this.contactRepository
            .createQueryBuilder('contact')
            .innerJoin('contact.application', 'application')
            .where('application.userId = :userId', { userId: user.id })
            .andWhere(
                '(LOWER(contact.name) LIKE LOWER(:query) OR LOWER(contact.email) LIKE LOWER(:query) OR contact.phone LIKE :query)',
                { query: `%${query}%` }
            )
            .leftJoinAndSelect('contact.application', 'app')
            .orderBy('contact.createdAt', 'DESC')
            .getMany();

        return contacts;
    }

    async update(id: string, updateContactDto: UpdateContactDto, user: User) {
        const contact = await this.findOne(id, user);

        Object.assign(contact, updateContactDto);

        return await this.contactRepository.save(contact);
    }

    async remove(id: string, user: User) {
        const contact = await this.findOne(id, user);
        await this.contactRepository.remove(contact);
        return { message: 'Contact deleted successfully' };
    }
}
