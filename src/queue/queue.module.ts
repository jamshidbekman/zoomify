import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { QueueCron } from './queue.cron';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { ReminderModule } from 'src/modules/reminder/reminder.module';
import { BullBoardModule } from '@bull-board/nestjs';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'lesson-reminder',
    }),
    BullBoardModule.forFeature({
      name: 'lesson-reminder',
      adapter: BullAdapter,
    }),
    ReminderModule,
  ],
  providers: [QueueCron, QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
