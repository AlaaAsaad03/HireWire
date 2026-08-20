import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApplicationStatus } from "../../entities/application.entity";
import { Type } from "class-transformer";

export class CreateApplicationDto {

    @IsString()
    @IsNotEmpty()
    company: string;

    @IsString()
    @IsNotEmpty()
    position: string;

    @IsDateString()
    @IsNotEmpty()
    appliedDate: string;

    @IsEnum(ApplicationStatus)
    @IsOptional()
    status?: ApplicationStatus;

    @IsString()
    @IsOptional()
    jobDescription?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    salary?: number;

    @IsString()
    @IsOptional()
    jobUrl?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsDateString()
    @IsOptional()
    interviewDate?: string | null;

    @IsString()
    @IsOptional()
    resumeVersion?: string;

    @IsString()
    @IsOptional()
    coverLetterText?: string;
}