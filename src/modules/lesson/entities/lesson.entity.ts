import { Reminder } from 'src/modules/reminder/entities/reminder.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lessons' })
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  teacher_name: string;

  @Column()
  meet: string;

  @Column()
  start: string;

  @Column({ nullable: true })
  end: string;

  @Column({ nullable: true })
  subject: string;

  @ManyToOne(() => Reminder, (reminder) => reminder.lessons, {
    onDelete: 'CASCADE',
  })
  reminder: Reminder;
}
