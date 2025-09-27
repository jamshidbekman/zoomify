import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramGroup } from './entities/telegram-group.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateTgGroup } from './types/create';

@Injectable()
export class TelegramGroupService {
  constructor(
    @InjectRepository(TelegramGroup)
    private readonly repository: Repository<TelegramGroup>,
    private readonly userService: UserService,
  ) {}

  async add(group: CreateTgGroup) {
    const findGroup = await this.repository.findOne({
      where: { tg_id: group.group_id },
    });

    if (findGroup) return findGroup;

    const user = await this.userService.upsert({ tg_id: group.admin_id });

    const create = this.repository.create({
      user: { id: user.id },
      tg_id: group.group_id,
      title: group.title,
    });

    return await this.repository.save(create);
  }

  async remove(tg_id: string): Promise<boolean> {
    const findGroup = await this.repository.findOne({
      where: { tg_id: tg_id },
    });

    if (!findGroup) return true;

    await this.repository.delete({ tg_id });

    return true;
  }

  async userGroups(tg_id: string) {
    const user = await this.userService.findByTgId(tg_id);
    if (!tg_id && !user) return [];
    return await this.repository.find({ where: { user: { id: user?.id } } });
  }

  async getGroup(group_id: string) {
    return await this.repository.findOneBy({ tg_id: group_id });
  }
}
