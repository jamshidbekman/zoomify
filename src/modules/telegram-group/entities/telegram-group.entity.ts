import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'telegram_groups' })
export class TelegramGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tg_id: string;

  @Column()
  title: string;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
