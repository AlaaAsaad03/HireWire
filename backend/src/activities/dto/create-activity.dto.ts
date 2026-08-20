import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ActivityType } from "../../entities/activity.entity";


export class CreateActivityDto {

    @IsEnum(ActivityType)
    @IsNotEmpty()
    type: ActivityType;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    activityDate?: Date;

    @IsUUID()
    @IsNotEmpty()
    applicationId: string;
}