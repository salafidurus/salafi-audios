import { Module } from '@nestjs/common';
import { LectureTopicsController } from './lecture-topics.controller';
import { LectureTopicsService } from './lecture-topics.service';
import { LectureTopicsRepository } from './lecture-topics.repo';

@Module({
  controllers: [LectureTopicsController],
  providers: [LectureTopicsService, LectureTopicsRepository],
  exports: [LectureTopicsService, LectureTopicsRepository],
})
export class LectureTopicsModule {}
