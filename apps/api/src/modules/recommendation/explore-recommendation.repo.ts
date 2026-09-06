/** Internal recommendation selection adapter for ordered Explore candidates. */
/* oxlint-disable anti-slop/require-tsdoc -- Internal candidate references are intentionally not public DTOs. */
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import { z } from 'zod';
import { PrismaService } from '../../core/db/prisma.service';

/** Entity references selected by a recommendation strategy. */
export type ExploreRecommendationBatch =
  | {
      kind: 'listings';
      id: string;
      reason: 'deterministic_recent';
      itemIds: string[];
    }
  | { kind: 'scholars'; id: string; reason: 'deterministic_senior_scholars'; itemIds: string[] }
  | { kind: 'topics'; id: string; reason: 'deterministic_topics'; itemIds: string[] };

/** Recommendation output consumed by an application module for hydration. */
export type ExploreRecommendationResult = {
  batches: ExploreRecommendationBatch[];
  nextCursor?: string;
  exhausted: boolean;
};

type ListingCursor = { date: Date; slug?: string };

const ListingCursorSchema = z.strictObject({
  date: z.iso.datetime(),
  slug: z.string().min(1),
});

function applyRecentFilters(where: Prisma.ListingWhereInput, cursor?: ListingCursor): void {
  if (!cursor) return;
  where.OR = cursor.slug
    ? [{ createdAt: { lt: cursor.date } }, { createdAt: cursor.date, slug: { lt: cursor.slug } }]
    : undefined;
  if (!cursor.slug) where.createdAt = { lt: cursor.date };
}

function buildRecentWhere(cursor?: ListingCursor): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    format: { in: ['single', 'series', 'collection'] },
    status: Status.published,
    deletedAt: null,
    parentId: null,
    scholar: { isActive: true },
  };
  applyRecentFilters(where, cursor);
  return where;
}

function paginate<T>(items: T[], limit: number) {
  const hasMore = items.length > limit;
  return { page: hasMore ? items.slice(0, limit) : items, hasMore };
}

/**
 * Decodes the Explore-owned Listing keyset cursor.
 *
 * A malformed cursor is rejected instead of being interpreted as a new feed
 * request; the cursor must preserve both parts of the `(createdAt, slug)`
 * ordering so equal timestamps cannot repeat or skip Listings.
 */
function decodeCursor(cursor?: string): ListingCursor | undefined {
  if (!cursor) return undefined;
  try {
    const decoded = ListingCursorSchema.parse(
      JSON.parse(Buffer.from(cursor, 'base64url').toString()),
    );
    return { date: new Date(decoded.date), slug: decoded.slug };
  } catch {
    throw new BadRequestException('The Explore recommendation cursor is invalid');
  }
}

function encodeCursor(date: Date, slug: string): string {
  return Buffer.from(JSON.stringify({ date: date.toISOString(), slug })).toString('base64url');
}

@Injectable()
/** Selects ordered entity references and continuation state for an Explore strategy. */
export class ExploreRecommendationRepo {
  constructor(private readonly prisma: PrismaService) {}

  // oxlint-disable-next-line complexity -- Selection coordinates three ordered recommendation families behind one small interface.
  async getRecommendations(cursor?: string, limit = 20): Promise<ExploreRecommendationResult> {
    const listings = await this.prisma.listing.findMany({
      where: buildRecentWhere(decodeCursor(cursor)),
      select: { id: true, slug: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { slug: 'desc' }],
      take: limit + 1,
    });
    const { page, hasMore } = paginate(listings, limit);
    const batches: ExploreRecommendationBatch[] = [];
    if (page.length > 0) {
      const batch = {
        kind: 'listings' as const,
        id: 'listings:recent',
        reason: 'deterministic_recent' as const,
        itemIds: page.map((item) => item.id),
      };
      batches.push(batch);
    }
    if (!cursor) {
      const [scholars, topics] = await Promise.all([
        this.prisma.scholar.findMany({
          where: { title: 'allamah', isActive: true },
          select: { id: true },
          orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
          take: 20,
        }),
        this.prisma.topic.findMany({
          where: {
            listingTopics: {
              some: {
                listing: {
                  format: { in: ['single', 'series', 'collection'] },
                  status: Status.published,
                  deletedAt: null,
                  parentId: null,
                  scholar: { isActive: true },
                },
              },
            },
          },
          select: { id: true },
          orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
          take: 20,
        }),
      ]);
      if (scholars.length)
        batches.push({
          kind: 'scholars',
          id: 'scholars:senior',
          reason: 'deterministic_senior_scholars',
          itemIds: scholars.map((item) => item.id),
        });
      if (topics.length)
        batches.push({
          kind: 'topics',
          id: 'topics:discoverable',
          reason: 'deterministic_topics',
          itemIds: topics.map((item) => item.id),
        });
    }
    const lastListing = page.at(-1);
    return {
      batches,
      nextCursor:
        hasMore && lastListing ? encodeCursor(lastListing.createdAt, lastListing.slug) : undefined,
      exhausted: !hasMore,
    };
  }
}
