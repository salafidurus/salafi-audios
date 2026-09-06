import { Injectable } from '@nestjs/common';
import { PrimaryDbService } from '../../core/db/primary-db.service';

/**
 * Carries ordered entity references across the recommendation/hydration seam;
 * it deliberately excludes localized presentation data and database records.
 * The fixed form and title kind make the initial strategy explicit while
 * leaving the public response free to evolve independently.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the type-level invariant is documented in the block above.
export type ScholarsRecommendation =
  | {
      /** Identifies the public batch renderer that will hydrate these references. */
      form: 'scholars';
      /** Stable identifier for the Allamah scholar batch. */
      id: 'scholars:allamah';
      /** Identifies the editorial title context represented by this reference batch. */
      titleKind: 'allamah';
      /** Ordered scholar IDs selected by the recommendation strategy. */
      itemIds: string[];
    }
  | {
      /** Identifies the public batch renderer that will hydrate these references. */
      form: 'scholar_listings';
      /** Stable identity derived from the associated public scholar slug. */
      id: string;
      /** Identifies the scholar without exposing an internal database ID. */
      scholarSlug: string;
      /** Internal scholar identity used only to constrain hydration. */
      scholarId: string;
      /** Identifies the editorial title context represented by this reference batch. */
      titleKind: 'scholar_listings';
      /** Ordered listing IDs selected by the recommendation strategy. */
      itemIds: string[];
    }
  | {
      /** Identifies the public batch renderer that will hydrate these references. */
      form: 'topic_scholars';
      /** Stable identity derived from the associated public topic slug. */
      id: string;
      /** Identifies the topic without exposing an internal database ID. */
      topicSlug: string;
      /** Internal topic identity used only to constrain hydration. */
      topicId: string;
      /** Identifies the editorial title context represented by this reference batch. */
      titleKind: 'topic_scholars';
      /** Ordered scholar IDs selected for the topic by the recommendation strategy. */
      itemIds: string[];
    };

@Injectable()
/** Selects root Scholars batches using stable editorial ordering and catalog eligibility. */
export class ScholarsRecommendationRepo {
  constructor(private readonly prisma: PrimaryDbService) {}

  /** Returns references only; presentation hydration remains owned by the Scholars caller. */
  async getRecommendations(): Promise<ScholarsRecommendation[]> {
    const [scholars, listings] = await Promise.all([
      this.prisma.scholar.findMany({
        where: { isActive: true, title: 'allamah' },
        select: { id: true, slug: true },
        orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
      }),
      this.prisma.listing.findMany({
        where: {
          parentId: null,
          status: 'published',
          deletedAt: null,
          scholar: { isActive: true },
        },
        select: {
          id: true,
          scholarId: true,
          topics: { select: { topicId: true, topic: { select: { slug: true } } } },
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { slug: 'asc' }],
      }),
    ]);

    const listingsByScholar = new Map<string, string[]>();
    const scholarIdsByTopic = new Map<string, Set<string>>();
    for (const listing of listings) {
      const itemIds = listingsByScholar.get(listing.scholarId) ?? [];
      itemIds.push(listing.id);
      listingsByScholar.set(listing.scholarId, itemIds);
      for (const relation of listing.topics) {
        const scholarIds = scholarIdsByTopic.get(relation.topicId) ?? new Set<string>();
        scholarIds.add(listing.scholarId);
        scholarIdsByTopic.set(relation.topicId, scholarIds);
      }
    }

    const topicIds = [...scholarIdsByTopic.keys()];
    const topics = topicIds.length
      ? await this.prisma.topic.findMany({
          where: { id: { in: topicIds } },
          select: { id: true, slug: true },
          orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
        })
      : [];
    const recommendedScholarIds = [
      ...new Set([...scholarIdsByTopic.values()].flatMap((ids) => [...ids])),
    ];
    const topicScholars = topicIds.length
      ? await this.prisma.scholar.findMany({
          where: { id: { in: recommendedScholarIds }, isActive: true },
          select: { id: true, slug: true },
          orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
        })
      : [];
    const scholarOrder = new Map(topicScholars.map((scholar, index) => [scholar.id, index]));

    return [
      {
        form: 'scholars',
        id: 'scholars:allamah',
        titleKind: 'allamah',
        itemIds: scholars.map((scholar) => scholar.id),
      },
      ...scholars.flatMap((scholar) => {
        const itemIds = listingsByScholar.get(scholar.id) ?? [];
        return itemIds.length
          ? [
              {
                form: 'scholar_listings' as const,
                id: `scholar-listings:${scholar.slug}`,
                scholarSlug: scholar.slug,
                scholarId: scholar.id,
                titleKind: 'scholar_listings' as const,
                itemIds,
              },
            ]
          : [];
      }),
      ...topics.flatMap((topic) => {
        const itemIds = [...(scholarIdsByTopic.get(topic.id) ?? [])]
          .filter((id) => scholarOrder.has(id))
          .sort((a, b) => (scholarOrder.get(a) ?? 0) - (scholarOrder.get(b) ?? 0));
        return itemIds.length
          ? [
              {
                form: 'topic_scholars' as const,
                id: `topic-scholars:${topic.slug}`,
                topicSlug: topic.slug,
                topicId: topic.id,
                titleKind: 'topic_scholars' as const,
                itemIds,
              },
            ]
          : [];
      }),
    ];
  }
}
