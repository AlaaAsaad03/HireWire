import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Application } from './application.entity';

export enum ContactRole {
    RECRUITER = 'recruiter',
    HIRING_MANAGER = 'hiring_manager',
    HR = 'hr',
    TEAM_MEMBER = 'team_member',
    OTHER = 'other',
}

@Entity('contacts')
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({
        type: 'enum',
        enum: ContactRole,
        default: ContactRole.RECRUITER,
    })
    role: ContactRole;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Application, (application) => application.contacts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column()
    applicationId: string;
}