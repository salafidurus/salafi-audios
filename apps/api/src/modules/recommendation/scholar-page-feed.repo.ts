import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/db/prisma.service';

/**
 * Carries ordered entity references across the recommendation/hydration seam;
 * it deliberately excludes localized presentation data and database records.
 * The fixed form and title kind make the initial strategy explicit while
 * leaving the public response free to evolve independently.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the type-level invariant is documented in the block above.
export type ScholarPageFeedRecommendation =
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
    };

@Injectable()
/** Selects active Allamah scholars using stable editorial ordering. */
export class ScholarPageFeedRepo {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns references only; presentation hydration remains owned by the Scholars caller. */
  async getRecommendations(): Promise<ScholarPageFeedRecommendation[]> {
    const scholars = await this.prisma.scholar.findMany({
      where: { isActive: true, title: 'allamah' },
      select: { id: true, slug: true },
      orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
    });

    const listings = await this.prisma.listing.findMany({
      where: {
        scholarId: { in: scholars.map((scholar) => scholar.id) },
        parentId: null,
        status: 'published',
        deletedAt: null,
      },
      select: { id: true, scholarId: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { slug: 'asc' }],
    });

    const listingsByScholar = new Map<string, string[]>();
    for (const listing of listings) {
      const itemIds = listingsByScholar.get(listing.scholarId) ?? [];
      itemIds.push(listing.id);
      listingsByScholar.set(listing.scholarId, itemIds);
    }

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
    ];
  }
}
