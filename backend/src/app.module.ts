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
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL') || configService.get<string>('INTERNAL_DATABASE_URL');
        const isProd = process.env.NODE_ENV === 'production' || !!dbUrl || configService.get<string>('DB_SSL') === 'true';

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [User, Application, Contact, Activity, Reminder, Tag],
            synchronize: true,
            logging: !isProd,
            ssl: isProd ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_DATABASE', 'hirewire'),
          entities: [User, Application, Contact, Activity, Reminder, Tag],
          synchronize: true,
          logging: !isProd,
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      },
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