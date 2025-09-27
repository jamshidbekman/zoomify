import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDocument } from './types/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async upsert(user: Omit<UserDocument, 'id'>): Promise<UserDocument> {
    const findByTgId = await this.repository.findOne({
      where: { tg_id: user.tg_id.toString() },
    });

    if (findByTgId) return findByTgId;

    const create = this.repository.create(user);

    return await this.repository.save({
      ...create,
      tg_id: user.tg_id.toString(),
    });
  }

  async findByTgId(tg_id: string) {
    return await this.repository.findOneBy({ tg_id });
  }
}
