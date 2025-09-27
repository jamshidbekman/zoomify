import { Reminder } from 'src/modules/reminder/entities/reminder.entity';

export type LessonDocument = {
  id?: string;
  teacher_name?: string;
  meet: string;
  start: string;
  end?: string;
  subject?: string | undefined;
  reminder?: Pick<Reminder, 'id'>;
};
