import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from './common/config/configuration';
import { BotModule } from './bot/bot.module';
import { UserModule } from './modules/user/user.module';
import { TelegramGroupModule } from './modules/telegram-group/telegram-group.module';
import { OpenAIModule } from './modules/openai/openai.module';
import { BullModule } from '@nestjs/bull';
import { LessonModule } from './modules/lesson/lesson.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { QueueModule } from './queue/queue.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          port: configService.get('DB_PORT'),
          host: configService.get('DB_HOST'),
          database: configService.get('DB_NAME'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          synchronize: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          redis: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            password: configService.get('REDIS_PASSWORD'),
          },
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    BotModule,
    UserModule,
    TelegramGroupModule,
    OpenAIModule,
    LessonModule,
    ReminderModule,
    QueueModule,
  ],
  providers: [],
})
export class AppModule {}
