import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';

export class UpdateActivityDto extends PartialType(OmitType(CreateActivityDto, ['applicationId'])) { }