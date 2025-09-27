import { Lesson } from 'src/modules/lesson/entities/lesson.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'reminders' })
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  start_date: string;

  @Column()
  tg_group_id: string;

  @OneToMany(() => Lesson, (lesson) => lesson.reminder)
  lessons: Lesson[];

  @ManyToOne(() => User)
  user: User;
}
