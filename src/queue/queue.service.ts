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
    await this.notifQueue.add(
      'lessonReminder',
      {
        chat_id: tg_group_id,
        message: `📚 Fan: *${lesson.subject}*\n👨‍🏫 O'qituvchi: ${lesson.teacher_name}\n 🕒 Vaqt: ${lesson.start} - ${lesson.end}\n 🔗 Dars havolasi:${lesson.meet}`,
      },
      {
        delay: remindAt.getTime() - Date.now(),
        removeOnComplete: true,
      },
    );
    return;
  }
}
