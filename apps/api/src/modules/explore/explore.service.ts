import { Injectable } from '@nestjs/common';
import type { FeedPageDto } from '@sd/core-contracts';
import { ExploreRecommendationService } from '../recommendation/explore-recommendation.service';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { ExploreRepo } from './explore.repo';
import { ExploreMapper } from './explore.mapper';

/** Explore application service that owns request-to-public-response orchestration. */
@Injectable()
/** Coordinates Explore request parameters and the public response projection. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreService {
  constructor(
    private readonly recommendation: ExploreRecommendationService,
    private readonly repo: ExploreRepo,
    private readonly mapper: ExploreMapper,
  ) {}

  async getRecentRecommendations(
    cursor?: string,
    limit = 20,
    topicSlug?: string,
  ): Promise<FeedPageDto> {
    const recommendations = await this.recommendation.recommend(cursor, limit, topicSlug);
    const page = await this.repo.hydrate(recommendations, getRequestLocale());
    return this.mapper.toFeedPage(page);
  }
}
