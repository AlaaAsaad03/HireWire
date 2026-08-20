import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, isUUID } from "class-validator";
import { ContactRole } from "../../entities/contact.entity";

export class CreateContactDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEnum(ContactRole)
    @IsNotEmpty()
    role?: ContactRole;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsUUID()
    @IsNotEmpty()
    applicationId: string;




}