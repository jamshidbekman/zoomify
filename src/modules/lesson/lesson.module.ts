import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson])],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
