import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { TopicsRepository } from './topics.repo';

@Module({
  controllers: [TopicsController],
  providers: [TopicsService, TopicsRepository],
  exports: [TopicsService, TopicsRepository],
})
export class TopicsModule {}
