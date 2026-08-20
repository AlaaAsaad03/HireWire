import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { Reminder } from '../entities/reminder.entity';
import { Application } from '../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder, Application])],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule { }