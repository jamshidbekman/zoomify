import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueueService } from '../queue/queue.service';
import { ReminderService } from 'src/modules/reminder/reminder.service';

@Injectable()
export class QueueCron {
  constructor(
    private readonly reminderService: ReminderService,
    private readonly queueService: QueueService,
  ) {}

  @Cron('50 10 * * *', {
    timeZone: 'Asia/Tashkent',
  })
  async scheduleDailyReminders() {
    const reminders = await this.reminderService.getTodayReminders();

    if (reminders.length == 0) return;

    for (const reminder of reminders) {
      if (reminder.lessons.length == 0) return;

      for (const lesson of reminder.lessons) {
        await this.queueService.addLessonReminder(
          {
            subject: lesson.subject,
            teacher_name: lesson.teacher_name,
            meet: lesson.meet,
            start: lesson.start,
            end: lesson.end,
          },
          reminder.tg_group_id,
        );
      }
    }
  }
}
