import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './entities/reminder.entity';
import { ReminderService } from './reminder.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder]), UserModule],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
