import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotUpdate } from './update/bot.update';
import { OpenAIModule } from 'src/modules/openai/openai.module';
import { UserModule } from 'src/modules/user/user.module';
import { TelegramGroupModule } from 'src/modules/telegram-group/telegram-group.module';
import { BotCommand } from './command/bot.command';
import * as LocalSession from 'telegraf-session-local';
import { ReminderModule } from 'src/modules/reminder/reminder.module';
import { LessonModule } from 'src/modules/lesson/lesson.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('BOT_TOKEN') ?? '',
        middlewares: [
          async (ctx, next) => {
            if (ctx.updateType === 'message') {
              if (ctx.chat?.type !== 'private') {
                return;
              }
            }
            return next();
          },
          new LocalSession({ database: 'session_db.json' }).middleware(),
        ],
      }),
      inject: [ConfigService],
    }),
    OpenAIModule,
    UserModule,
    TelegramGroupModule,
    ReminderModule,
    LessonModule,
  ],
  providers: [BotUpdate, BotCommand],
})
export class BotModule {}
