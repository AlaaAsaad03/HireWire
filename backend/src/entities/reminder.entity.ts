import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Application } from './application.entity';

export enum ReminderType {
    FOLLOW_UP = 'follow_up',
    INTERVIEW_PREP = 'interview_prep',
    THANK_YOU = 'thank_you',
    CUSTOM = 'custom',
}

@Entity('reminders')
export class Reminder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ReminderType,
    })
    type: ReminderType;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp' })
    reminderDate: Date;

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Application, (application) => application.reminders, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column()
    applicationId: string;
}