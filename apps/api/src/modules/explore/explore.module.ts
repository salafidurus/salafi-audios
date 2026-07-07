import { Module } from '@nestjs/common';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';
import { ExploreRepo } from './explore.repo';

@Module({
  controllers: [ExploreController],
  providers: [ExploreService, ExploreRepo],
})
export class ExploreModule {}
