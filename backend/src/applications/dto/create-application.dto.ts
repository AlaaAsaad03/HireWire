import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApplicationStatus } from "../../entities/application.entity";

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
    interviewDate?: string;

    @IsString()
    @IsOptional()
    resumeVersion?: string;

    @IsString()
    @IsOptional()
    coverLetterText?: string;
}