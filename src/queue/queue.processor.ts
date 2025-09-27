import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Processor('lesson-reminder')
export class QueueProcessor {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  @Process('lessonReminder')
  async handleLessonReminder(job: Job) {
    const { chat_id, message } = job.data;
    await this.bot.telegram.sendMessage(chat_id, message);
  }

  @Process('morningSummary')
  async handleMorningSummary(job: Job) {
    const { chat_id, message } = job.data;
    await this.bot.telegram.sendMessage(chat_id, message, {
      parse_mode: 'Markdown',
    });
  }
}
