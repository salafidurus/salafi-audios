import {
  ExploreRecommendationSchemaVersion,
  FeedPageDtoSchema,
  type ExploreListingsBatchDto,
  type ExploreScholarsBatchDto,
  type ExploreTopicsBatchDto,
  type FeedPageDto,
} from '@sd/core-contracts';
import type { ExploreRecommendationPage } from '../explore-recommendation/explore-recommendation.repo';

/** Maps internal recommendation batches into the versioned public Explore contract. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The preceding TSDoc describes the public projection invariant.
export class ExploreMapper {
  toFeedPage(page: ExploreRecommendationPage): FeedPageDto {
    return FeedPageDtoSchema.parse({
      schemaVersion: ExploreRecommendationSchemaVersion,
      batches: page.batches.map((batch) => this.toFeedBatch(batch)),
      nextCursor: page.nextCursor,
      exhausted: page.exhausted,
    });
  }

  private toFeedBatch(
    batch: ExploreRecommendationPage['batches'][number],
  ): ExploreListingsBatchDto | ExploreScholarsBatchDto | ExploreTopicsBatchDto {
    if (batch.kind === 'listings') {
      return {
        kind: batch.kind,
        id: batch.id,
        title: batch.title,
        reason: batch.reason,
        items: batch.items,
      };
    }
    if (batch.kind === 'scholars') {
      return {
        kind: batch.kind,
        id: batch.id,
        title: batch.title,
        reason: batch.reason,
        items: batch.items,
      };
    }
    return {
      kind: batch.kind,
      id: batch.id,
      title: batch.title,
      reason: batch.reason,
      items: batch.items,
    };
  }
}
