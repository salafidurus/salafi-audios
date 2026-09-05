import {
  ExploreRecommendationSchemaVersion,
  FeedPageDtoSchema,
  type ExploreListingsBatchDto,
  type ExploreScholarsBatchDto,
  type ExploreTopicsBatchDto,
  type FeedPageDto,
} from '@sd/core-contracts';
import type { ExplorePage } from './explore.repo';

/** Maps internal recommendation batches into the versioned public Explore contract. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The preceding TSDoc describes the public projection invariant.
export class ExploreMapper {
  toFeedPage(page: ExplorePage): FeedPageDto {
    return FeedPageDtoSchema.parse({
      schemaVersion: ExploreRecommendationSchemaVersion,
      batches: page.batches.map((batch) => this.toFeedBatch(batch)),
      nextCursor: page.nextCursor,
      exhausted: page.exhausted,
    });
  }

  private toFeedBatch(
    batch: ExplorePage['batches'][number],
  ): ExploreListingsBatchDto | ExploreScholarsBatchDto | ExploreTopicsBatchDto {
    if (batch.kind === 'listings') {
      return {
        kind: batch.kind,
        id: batch.id,
        title: batch.topicSlug
          ? { kind: 'topic_listings', topicSlug: batch.topicSlug, label: batch.topicSlug }
          : { kind: 'listings', id: 'recent', label: 'Continue exploring' },
        reason: batch.reason,
        items: batch.items,
      };
    }
    if (batch.kind === 'scholars') {
      return {
        kind: batch.kind,
        id: batch.id,
        title: { kind: 'scholars', id: 'senior_scholars', label: 'Senior Scholars' },
        reason: batch.reason,
        items: batch.items,
      };
    }
    return {
      kind: batch.kind,
      id: batch.id,
      title: { kind: 'topics', id: 'discoverable_topics', label: 'Explore topics' },
      reason: batch.reason,
      items: batch.items,
    };
  }
}
