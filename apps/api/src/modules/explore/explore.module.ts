import { Module } from '@nestjs/common';
import { ExploreRecommendationModule } from '../explore-recommendation/explore-recommendation.module';
import { ExploreController } from './explore.controller';
import { ExploreMapper } from './explore.mapper';
import { ExploreService } from './explore.service';

@Module({
  imports: [ExploreRecommendationModule],
  controllers: [ExploreController],
  providers: [ExploreMapper, ExploreService],
})
/** Registers the public Explore caller and its recommendation dependencies. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreModule {}
