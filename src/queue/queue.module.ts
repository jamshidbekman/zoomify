import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueCron } from './queue.cron';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { ReminderModule } from 'src/modules/reminder/reminder.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'lesson-reminder',
    }),
    ReminderModule,
  ],
  providers: [QueueCron, QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
