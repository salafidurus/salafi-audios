import { Module } from '@nestjs/common';
import { CollectionTopicsController } from './collection-topics.controller';
import { CollectionTopicsService } from './collection-topics.service';
import { CollectionTopicsRepository } from './collection-topics.repo';

@Module({
  controllers: [CollectionTopicsController],
  providers: [CollectionTopicsService, CollectionTopicsRepository],
  exports: [CollectionTopicsService, CollectionTopicsRepository],
})
export class CollectionTopicsModule {}
