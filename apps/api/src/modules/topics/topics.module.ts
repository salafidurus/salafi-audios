import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { AdminTopicsController } from './admin-topics.controller';
import { TopicsService } from './topics.service';
import { TopicsRepository } from './topics.repo';

@Module({
  controllers: [TopicsController, AdminTopicsController],
  providers: [TopicsService, TopicsRepository],
  exports: [TopicsService, TopicsRepository],
})
export class TopicsModule {}
