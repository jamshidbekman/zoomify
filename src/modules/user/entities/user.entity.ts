import { Reminder } from 'src/modules/reminder/entities/reminder.entity';
import { TelegramGroup } from 'src/modules/telegram-group/entities/telegram-group.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tg_id: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @OneToMany(() => TelegramGroup, (group) => group.user)
  tg_groups: TelegramGroup[];

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];
}
