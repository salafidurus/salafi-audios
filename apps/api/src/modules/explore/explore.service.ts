import { Injectable } from '@nestjs/common';
import type { FeedPageDto } from '@sd/core-contracts';
import { ExploreRecommendationEngine } from '../explore-recommendation/explore-recommendation.engine';
import { ExploreMapper } from './explore.mapper';

/** Explore application service that owns request-to-public-response orchestration. */
@Injectable()
/** Coordinates Explore request parameters and the public response projection. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreService {
  constructor(
    private readonly engine: ExploreRecommendationEngine,
    private readonly mapper: ExploreMapper,
  ) {}

  async getRecentRecommendations(
    cursor?: string,
    limit = 20,
    topicSlug?: string,
  ): Promise<FeedPageDto> {
    const page = await this.engine.recommend(cursor, limit, topicSlug);
    return this.mapper.toFeedPage(page);
  }
}
