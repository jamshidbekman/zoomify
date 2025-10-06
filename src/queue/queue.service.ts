import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { subMinutes, format } from 'date-fns';
import { Markup } from 'telegraf';
import { LessonDocument } from 'src/modules/lesson/types/lesson';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('lesson-reminder')
    private readonly notifQueue: Queue,
  ) {}

  async addLessonReminder(lesson: LessonDocument, tg_group_id: string) {
    const timeZone = 'Asia/Tashkent';
    const lessonStart = fromZonedTime(lesson.start, timeZone);
    const remindAt = subMinutes(lessonStart, 1);
    const delay = remindAt.getTime() - Date.now();

    const message = `
🎓 *Dars boshlanmoqda!*

📚 *Fan:* ${lesson.subject}
👨‍🏫 *O‘qituvchi:* ${lesson.teacher_name}
🕒 *Boshlanish vaqti:* ${formatInTimeZone(lessonStart, 'Asia/Tashkent', 'HH:mm')}

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
  }
}
