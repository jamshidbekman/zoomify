import { Module } from '@nestjs/common';
import { TelegramGroupService } from './telegram-group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramGroup } from './entities/telegram-group.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramGroup]), UserModule],
  providers: [TelegramGroupService],
  exports: [TelegramGroupService],
})
export class TelegramGroupModule {}
