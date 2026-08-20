import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Application } from './application.entity';

export enum ActivityType {
    APPLICATION_SUBMITTED = 'application_submitted',
    EMAIL_RECEIVED = 'email_received',
    EMAIL_SENT = 'email_sent',
    PHONE_CALL_RECEIVED = 'phone_call_received',
    PHONE_CALL_MADE = 'phone_call_made',
    INTERVIEW_SCHEDULED = 'interview_scheduled',
    INTERVIEW_COMPLETED = 'interview_completed',
    FOLLOW_UP_SENT = 'follow_up_sent',
    STATUS_CHANGED = 'status_changed',
    NOTE_ADDED = 'note_added',
    OTHER = 'other',
}

@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ActivityType,
    })
    type: ActivityType;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    activityDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Application, (application) => application.activities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'applicationId' })
    application: Application;

    @Column()
    applicationId: string;
}