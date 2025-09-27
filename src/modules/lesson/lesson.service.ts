import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { LessonDocument } from './types/lesson';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson) private readonly repository: Repository<Lesson>,
  ) {}

  async create(lesson: LessonDocument) {
    const create = this.repository.create(lesson);

    return await this.repository.save(create);
  }
}
