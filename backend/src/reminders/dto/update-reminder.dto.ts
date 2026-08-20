import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReminderDto } from './create-reminder.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReminderDto extends PartialType(OmitType(CreateReminderDto, ['applicationId'])) {
    @IsBoolean()
    @IsOptional()
    isCompleted?: boolean;
}