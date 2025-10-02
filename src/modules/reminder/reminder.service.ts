import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reminder } from './entities/reminder.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder)
    private readonly repository: Repository<Reminder>,
    private readonly userService: UserService,
  ) {}

  async create(reminder: {
    title: string;
    start_date?: string;
    tg_group_id: string;
    user_tg_id: string;
  }) {
    const user = await this.userService.findByTgId(reminder.user_tg_id);

    if (!user) return null;

    const create = this.repository.create({
      ...reminder,
      user: { id: user.id },
    });

    return await this.repository.save(create);
  }

  async getReminder(id: string) {
    const reminder = await this.repository.findOne({
      where: { id },
      relations: ['lessons'],
    });

    return reminder;
  }

  async getReminders(tg_id: string) {
    const reminders = await this.repository.find({
      where: { user: { tg_id } },
      relations: ['lessons'],
    });

    return reminders;
  }

  async delete(id: string) {
    await this.repository.delete({ id });
  }

  async getTodayReminders() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const reminders = await this.repository.find({
      where: { start_date: todayStr },
      relations: ['lessons', 'user'],
    });

    return reminders;
  }
}
