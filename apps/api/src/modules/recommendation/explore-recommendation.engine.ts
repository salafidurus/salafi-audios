import { Injectable } from '@nestjs/common';
import type { ExploreRecommendationResult } from './explore-recommendation.repo';
import { ExploreRecommendationRepo } from './explore-recommendation.repo';

@Injectable()
/** Executes the selected recommendation strategy without owning HTTP concerns. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreRecommendationEngine {
  constructor(private readonly repo: ExploreRecommendationRepo) {}

  recommend(cursor?: string, limit = 20): Promise<ExploreRecommendationResult> {
    return this.repo.getRecommendations(cursor, limit);
  }
}
