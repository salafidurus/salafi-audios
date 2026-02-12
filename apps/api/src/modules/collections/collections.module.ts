import { Module } from '@nestjs/common';
import { CollectionsPublicController } from './collections-public.controller';
import { CollectionsController } from './collections.controller';
import { CollectionRepository } from './collections.repo';
import { CollectionService } from './collections.service';

@Module({
  controllers: [CollectionsController, CollectionsPublicController],
  providers: [CollectionService, CollectionRepository],
  exports: [CollectionService],
})
export class CollectionsModule {}
