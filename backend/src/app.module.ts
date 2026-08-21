import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Application } from './entities/application.entity';
import { Contact } from './entities/contact.entity';
import { Activity } from './entities/activity.entity';
import { Reminder } from './entities/reminder.entity';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { ContactsModule } from './contacts/contacts.module';
import { ActivitiesModule } from './activities/activities.module';
import { RemindersModule } from './reminders/reminders.module';
import { AiModule } from './ai/ai.module';
import { MatchModule } from './match/match.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TagsModule } from './tags/tags.module';
import { Tag } from './entities/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Application, Contact, Activity, Reminder, Tag],
        synchronize: true,
        logging: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ApplicationsModule,
    ContactsModule,
    ActivitiesModule,
    RemindersModule,
    AiModule,
    MatchModule,
    AnalyticsModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }