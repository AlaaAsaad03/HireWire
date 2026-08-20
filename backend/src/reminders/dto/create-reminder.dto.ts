import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ReminderType } from '../../entities/reminder.entity';

export class CreateReminderDto {
    @IsEnum(ReminderType)
    @IsNotEmpty()
    type: ReminderType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsNotEmpty()
    reminderDate: string;

    @IsUUID()
    @IsNotEmpty()
    applicationId: string;
}