import { toZonedTime } from 'date-fns-tz';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { LessonDocument } from 'src/modules/lesson/types/lesson';
import { subMinutes, format } from 'date-fns';
import { Markup } from 'telegraf';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('lesson-reminder')
    private readonly notifQueue: Queue,
  ) {}

  async addLessonReminder(lesson: LessonDocument, tg_group_id: string) {
    const timeZone = 'Asia/Tashkent';
    const lessonStart = toZonedTime(new Date(lesson.start), timeZone);
    const remindAt = subMinutes(lessonStart, 1);
    const nowInTashkent = toZonedTime(new Date(), timeZone);
    const delay = remindAt.getTime() - nowInTashkent.getTime();
    const message = `
🎓 *Dars boshlanmoqda!*

📚 *Fan:* ${lesson.subject}
👨‍🏫 *O‘qituvchi:* ${lesson.teacher_name}
🕒 *Boshlanish vaqti:* ${format(lessonStart, 'HH:mm')}

Darsga o‘z vaqtida qo‘shiling 👇
`;
    const replyMarkup = Markup.inlineKeyboard([
      Markup.button.url('🔗 Darsga kirish', lesson.meet),
    ]);

    await this.notifQueue.add(
      'lessonReminder',
      {
        chat_id: tg_group_id,
        message,
        options: {
          parse_mode: 'Markdown',
          ...replyMarkup,
        },
      },
      {
        delay: Math.max(delay, 0),
        removeOnComplete: true,
      },
    );
    return;
  }
}
