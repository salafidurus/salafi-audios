import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/db/prisma.service';

/**
 * Carries ordered entity references across the recommendation/hydration seam;
 * it deliberately excludes localized presentation data and database records.
 * The fixed form and title kind make the initial strategy explicit while
 * leaving the public response free to evolve independently.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the type-level invariant is documented in the block above.
export type ScholarPageFeedRecommendation = {
  /** Identifies the public batch renderer that will hydrate these references. */
  form: 'scholars';
  /** Stable identifier for the Allamah scholar batch. */
  id: 'scholars:allamah';
  /** Identifies the editorial title context represented by this reference batch. */
  titleKind: 'allamah';
  /** Ordered scholar IDs selected by the recommendation strategy. */
  itemIds: string[];
};

@Injectable()
/** Selects active Allamah scholars using stable editorial ordering. */
export class ScholarPageFeedRepo {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns references only; presentation hydration remains owned by the Scholars caller. */
  async getRecommendations(): Promise<ScholarPageFeedRecommendation> {
    const scholars = await this.prisma.scholar.findMany({
      where: { isActive: true, title: 'allamah' },
      select: { id: true },
      orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
    });

    return {
      form: 'scholars',
      id: 'scholars:allamah',
      titleKind: 'allamah',
      itemIds: scholars.map((scholar) => scholar.id),
    };
  }
}
