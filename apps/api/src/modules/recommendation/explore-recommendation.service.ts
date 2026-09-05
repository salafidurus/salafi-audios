/** Public Explore recommendation seam exported by the generic RecommendationModule. */
/* oxlint-disable anti-slop/require-tsdoc -- The exported service interface is documented below; its DTO is internal. */
import { Injectable } from '@nestjs/common';
import type { ExploreRecommendationResult } from './explore-recommendation.repo';
import { ExploreRecommendationEngine } from './explore-recommendation.engine';

/** Exposes the Explore recommendation interface while hiding strategy details. */
@Injectable()
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreRecommendationService {
  constructor(private readonly engine: ExploreRecommendationEngine) {}

  recommend(cursor?: string, limit = 20): Promise<ExploreRecommendationResult> {
    return this.engine.recommend(cursor, limit);
  }
}
