import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Processor('lesson-reminder')
export class QueueProcessor {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  @Process('lessonReminder')
  async handleLessonReminder(job: Job) {
    const { chat_id, message, options } = job.data;

    try {
      await this.bot.telegram.sendMessage(chat_id, message, options);
    } catch (error) {
      console.error('❌ Xabar yuborishda xatolik:', error);
    }
  }
}
