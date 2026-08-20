import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from '../entities/activity.entity';
import { Application } from '../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Application])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule { }