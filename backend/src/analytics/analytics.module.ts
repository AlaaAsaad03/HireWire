import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Application } from '../entities/application.entity';
import { Activity } from '../entities/activity.entity';
import { AdvancedAnalyticsService } from './advanced.service';

@Module({
    imports: [TypeOrmModule.forFeature([Application, Activity])],
    providers: [AnalyticsService, AdvancedAnalyticsService],
    controllers: [AnalyticsController],
})
export class AnalyticsModule { }