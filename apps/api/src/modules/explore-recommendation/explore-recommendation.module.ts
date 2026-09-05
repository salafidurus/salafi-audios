import { Module } from '@nestjs/common';
import { ExploreRecommendationEngine } from './explore-recommendation.engine';
import { ExploreRecommendationRepo } from './explore-recommendation.repo';

@Module({
  providers: [ExploreRecommendationRepo, ExploreRecommendationEngine],
  exports: [ExploreRecommendationEngine],
})
/** Provides the recommendation engine to the Explore application module only. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreRecommendationModule {}
