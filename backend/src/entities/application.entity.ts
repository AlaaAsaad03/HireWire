import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Contact } from './contact.entity';
import { Activity } from './activity.entity';
import { Reminder } from './reminder.entity';
import { Tag } from './tag.entity';

export enum ApplicationStatus {
    APPLIED = 'applied',
    INTERVIEW_SCHEDULED = 'interview_scheduled',
    INTERVIEWED = 'interviewed',
    OFFER = 'offer',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
}

@Entity('applications')
export class Application {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    company: string;

    @Column()
    position: string;

    @Column({ type: 'date' })
    appliedDate: Date;

    @Column({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.APPLIED,
    })
    status: ApplicationStatus;

    @Column({ type: 'text', nullable: true })
    jobDescription: string;

    @Column({ nullable: true })
    location: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salary: number;

    @Column({ nullable: true })
    jobUrl: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'date', nullable: true })
    interviewDate: Date;

    @Column({ nullable: true })
    resumeVersion: string;

    @Column({ type: 'text', nullable: true })
    coverLetterText: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @OneToMany(() => Contact, (contact) => contact.application)
    contacts: Contact[];

    @OneToMany(() => Activity, (activity) => activity.application)
    activities: Activity[];

    @OneToMany(() => Reminder, (reminder) => reminder.application)
    reminders: Reminder[];

    @ManyToMany(() => Tag, (tag) => tag.applications)
    @JoinTable()
    tags: Tag[];
}