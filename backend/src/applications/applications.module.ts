import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from '../entities/application.entity';
import { Tag } from '../entities/tag.entity';
import { BulkService } from './bulk.service';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Tag]),
    RemindersModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, BulkService],
})
export class ApplicationsModule { }