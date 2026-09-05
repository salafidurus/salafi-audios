import { Module } from '@nestjs/common';
import { ExploreRecommendationEngine } from './explore-recommendation.engine';
import { ExploreRecommendationRepo } from './explore-recommendation.repo';
import { ExploreRecommendationService } from './explore-recommendation.service';
import { ScholarPageFeedEngine } from './scholar-page-feed.engine';
import { ScholarPageFeedRepo } from './scholar-page-feed.repo';
import { ScholarPageFeedService } from './scholar-page-feed.service';

@Module({
  providers: [
    ExploreRecommendationRepo,
    ExploreRecommendationEngine,
    ExploreRecommendationService,
    ScholarPageFeedRepo,
    ScholarPageFeedEngine,
    ScholarPageFeedService,
  ],
  exports: [ExploreRecommendationService, ScholarPageFeedService],
})
/** Provides the recommendation engine to the Explore application module only. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class RecommendationModule {}
