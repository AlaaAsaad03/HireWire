import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Application } from './application.entity';

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    color: string; // e.g., "#8b5cf6", "#ec4899", "#10b981"

    @ManyToOne(() => User)
    user: User;

    @ManyToMany(() => Application, (application) => application.tags)
    applications: Application[];

    @CreateDateColumn()
    createdAt: Date;
}