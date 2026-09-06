import { Module } from '@nestjs/common';
import { ExploreRecommendationEngine } from './explore-recommendation.engine';
import { ExploreRecommendationRepo } from './explore-recommendation.repo';
import { ExploreRecommendationService } from './explore-recommendation.service';
import { ScholarsRecommendationEngine } from './scholars-recommendation.engine';
import { ScholarsRecommendationRepo } from './scholars-recommendation.repo';
import { ScholarsRecommendationService } from './scholars-recommendation.service';

@Module({
  providers: [
    ExploreRecommendationRepo,
    ExploreRecommendationEngine,
    ExploreRecommendationService,
    ScholarsRecommendationRepo,
    ScholarsRecommendationEngine,
    ScholarsRecommendationService,
  ],
  exports: [ExploreRecommendationService, ScholarsRecommendationService],
})
/** Provides the recommendation engine to the Explore application module only. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class RecommendationModule {}
