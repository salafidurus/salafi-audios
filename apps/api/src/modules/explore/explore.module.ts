import { Module } from '@nestjs/common';
import { RecommendationModule } from '../recommendation/recommendation.module';
import { ExploreController } from './explore.controller';
import { ExploreMapper } from './explore.mapper';
import { ExploreService } from './explore.service';
import { ExploreRepo } from './explore.repo';

@Module({
  imports: [RecommendationModule],
  controllers: [ExploreController],
  providers: [ExploreMapper, ExploreService, ExploreRepo],
})
/** Registers the public Explore caller and its recommendation dependencies. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreModule {}
