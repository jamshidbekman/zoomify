import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { LessonDocument } from 'src/modules/lesson/types/lesson';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('lesson-reminder')
    private readonly notifQueue: Queue,
  ) {}

  async addLessonReminder(lesson: LessonDocument, tg_group_id: string) {
    const startDate = new Date(lesson.start);
    const remindAt = new Date(startDate.getTime() - 1 * 60 * 1000);
    const job = await this.notifQueue.add(
      'lessonReminder',
      {
        chat_id: tg_group_id,
        message: `📚 *${lesson.subject}*\n👨‍🏫 ${lesson.teacher_name}\n🕒 ${lesson.start} - ${lesson.end}\n🔗 Meet:${lesson.meet}`,
      },
      {
        delay: remindAt.getTime() - Date.now(),
        removeOnComplete: true,
      },
    );
    console.log(job.id)
    return;
  }

  async addMorningSummary(chat_id: string, lessons: LessonDocument[]) {
    const text =
      '📌 Bugungi darslar:\n\n' +
      lessons
        .map(
          (l, i) =>
            `${i + 1}. *${l.subject}* — ${l.teacher_name}\n🕒 ${l.start} - ${l.end}`,
        )
        .join('\n\n');

    return this.notifQueue.add(
      'morningSummary',
      { chat_id, message: text },
      {
        delay: 0,
        removeOnComplete: true,
      },
    );
  }
}
