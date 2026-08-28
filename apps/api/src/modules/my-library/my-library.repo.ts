import { Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import type {
  Locale,
  ListingFormat,
  MyLibraryItemDto,
  RecentProgressDto,
  ListingProgressSummaryDto,
  SavedDeltaItemDto,
  SavedSyncItemDto,
} from '@sd/core-contracts';
import { PrismaService } from '../../core/db/prisma.service';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { ListingRepository } from '../listing/listing.repo';
import { ConfigService } from '../../core/config/config.service';

type ProgressGroup = { latestUpdatedAt: Date };
type ProgressBucket = {
  topLevelId: string;
  latestUpdatedAt: Date;
  summary: ListingProgressSummaryDto;
};

type RecentParent = {
  id: string;
  title: string;
  slug: string;
  format: ListingFormat;
  language: Locale | null;
  translations: { title: string }[];
  coverImageUrl: string | null;
  parent?: RecentParent | null;
};

type RecentProgressRecord = {
  positionSeconds: number;
  listing: {
    title: string;
    slug: string;
    format: ListingFormat;
    orderIndex: number | null;
    publishedLectureCount: number | null;
    language: Locale | null;
    durationSeconds: number | null;
    coverImageUrl: string | null;
    translations: { title: string }[];
    scholar: {
      slug: string;
      name: string;
      mainLanguage: Locale | null;
      imageUrl: string | null;
      translations: { name: string }[];
    };
    parent?: RecentParent | null;
  };
};

function getRecentArtworkKey(listing: {
  coverImageUrl: string | null;
  parent?: RecentParent | null;
}) {
  return [
    listing.coverImageUrl,
    listing.parent?.coverImageUrl,
    listing.parent?.parent?.coverImageUrl,
  ].find((key): key is string => Boolean(key));
}

function getRecentSeriesContext(parent: RecentParent | null | undefined, locale: Locale) {
  if (!parent) return null;
  return {
    seriesId: parent.id,
    seriesTitle: resolveContentTranslation({
      base: { title: parent.title },
      originalLanguage: parent.language,
      targetLocale: locale,
      publishedTranslation: parent.translations[0] ?? null,
    }).fields.title,
    seriesSlug: parent.slug,
  };
}

function getRecentRootListing(
  parent: RecentParent | null | undefined,
  grandparent: RecentParent | null | undefined,
  seriesContext: { seriesTitle: string } | null,
  locale: Locale,
) {
  if (grandparent) {
    return {
      id: grandparent.id,
      slug: grandparent.slug,
      title: resolveContentTranslation({
        base: { title: grandparent.title },
        originalLanguage: grandparent.language,
        targetLocale: locale,
        publishedTranslation: grandparent.translations[0] ?? null,
      }).fields.title,
    };
  }
  if (!parent) return null;
  return { id: parent.id, slug: parent.slug, title: seriesContext?.seriesTitle ?? parent.title };
}

function getRecentProgressScalars(record: RecentProgressRecord) {
  const listing = record.listing;
  return {
    orderIndex: listing.orderIndex ?? undefined,
    publishedLectureCount: listing.publishedLectureCount ?? undefined,
    durationSeconds: listing.durationSeconds ?? 0,
    scholarImageUrl: listing.scholar.imageUrl ?? undefined,
  };
}

function groupProgressRecords(
  records: ProgressLeafRecord[],
  resolveTopLevelId: (record: ProgressLeafRecord) => string,
) {
  const groups = new Map<string, ProgressGroup>();
  for (const record of records) {
    const topLevelId = resolveTopLevelId(record);
    const existing = groups.get(topLevelId);
    if (!existing || record.updatedAt > existing.latestUpdatedAt)
      groups.set(topLevelId, { latestUpdatedAt: record.updatedAt });
  }
  return groups;
}

function bucketProgressSummaries(
  topLevelIds: string[],
  summaries: (ListingProgressSummaryDto | null)[],
  groups: Map<string, ProgressGroup>,
  onlyCompleted: boolean,
): ProgressBucket[] {
  return topLevelIds.flatMap((topLevelId, index) => {
    const summary = summaries[index];
    if (!summary || summary.isCompleted !== onlyCompleted) return [];
    return [{ topLevelId, latestUpdatedAt: groups.get(topLevelId)!.latestUpdatedAt, summary }];
  });
}
const DEFAULT_PAGE_SIZE = 20;

const listingRelationSelect = (locale: Locale) =>
  ({
    id: true,
    title: true,
    slug: true,
    language: true,
    durationSeconds: true,
    translations: {
      where: { locale, status: 'published' },
      select: { title: true },
      take: 1,
    },
    scholar: {
      select: {
        id: true,
        slug: true,
        name: true,
        mainLanguage: true,
        translations: {
          where: { locale, status: 'published' },
          select: { name: true },
          take: 1,
        },
      },
    },
    parent: {
      select: {
        title: true,
        language: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
      },
    },
  }) satisfies Prisma.ListingSelect;

type ListingRelation = {
  id: string;
  title: string;
  slug: string;
  language: Locale | null;
  durationSeconds: number | null;
  translations: { title: string }[];
  scholar: {
    id: string;
    slug: string;
    name: string;
    mainLanguage: Locale | null;
    translations: { name: string }[];
  };
  parent: {
    title: string;
    language: Locale | null;
    translations: { title: string }[];
  } | null;
};

/** A user's raw progress on one leaf listing, with enough of its ancestor chain to resolve the top-level Listing it rolls up to. */
type ProgressLeafRecord = {
  listingId: string;
  positionSeconds: number;
  isCompleted: boolean;
  updatedAt: Date;
  listing: { parentId: string | null; parent: { parentId: string | null } | null };
};

@Injectable()
export class MyLibraryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingRepo: ListingRepository,
    @Optional() private readonly config?: ConfigService,
  ) {}

  async findInProgress(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: MyLibraryItemDto[]; nextCursor?: string }> {
    return this.findRolledUpProgress(userId, cursor, limit, { onlyCompleted: false });
  }

  async findCompleted(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: MyLibraryItemDto[]; nextCursor?: string }> {
    return this.findRolledUpProgress(userId, cursor, limit, { onlyCompleted: true });
  }

  /**
   * "In Progress" and "Completed" must show top-level Listings, not the raw
   * Lesson/Module rows `UserListingProgress` is keyed on — a series with
   * progress on 3 lessons is one series entry, not three. This groups a
   * user's leaf-level progress by top-level ancestor, resolves each group's
   * lesson-count rollup via `ListingRepository.getProgressSummaryByListingId`
   * (the same aggregation the listing detail page uses), and buckets by
   * whether that rollup is fully completed.
   */
  private async findRolledUpProgress(
    userId: string,
    cursor: string | undefined,
    limit: number,
    { onlyCompleted }: { onlyCompleted: boolean },
  ): Promise<{ items: MyLibraryItemDto[]; nextCursor?: string }> {
    const locale = getRequestLocale();

    const records: ProgressLeafRecord[] = await this.prisma.userListingProgress.findMany({
      where: {
        userId,
        OR: [{ positionSeconds: { gt: 0 } }, { isCompleted: true }],
      },
      select: {
        listingId: true,
        positionSeconds: true,
        isCompleted: true,
        updatedAt: true,
        listing: { select: { parentId: true, parent: { select: { parentId: true } } } },
      },
    });

    const groups = groupProgressRecords(records, (record) => this.resolveTopLevelId(record));

    const topLevelIds = Array.from(groups.keys());
    const summaries = await Promise.all(
      topLevelIds.map((topLevelId) =>
        this.listingRepo.getProgressSummaryByListingId(topLevelId, userId),
      ),
    );

    const bucketed = bucketProgressSummaries(topLevelIds, summaries, groups, onlyCompleted);
    bucketed.sort((a, b) => b.latestUpdatedAt.getTime() - a.latestUpdatedAt.getTime());

    const startIndex = cursor ? bucketed.findIndex((b) => b.topLevelId === cursor) + 1 : 0;
    const page = bucketed.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < bucketed.length;
    const nextCursor = hasMore ? page[page.length - 1]?.topLevelId : undefined;

    if (page.length === 0) return { items: [], nextCursor: undefined };

    const listings = await this.prisma.listing.findMany({
      where: { id: { in: page.map((p) => p.topLevelId) } },
      select: listingRelationSelect(locale),
    });
    const listingById = new Map(listings.map((l) => [l.id, l]));
    const leafById = new Map(records.map((r) => [r.listingId, r]));

    const items = page.flatMap(({ topLevelId, latestUpdatedAt, summary }) => {
      const listing = listingById.get(topLevelId);
      if (!listing || !summary) return [];

      const leafRecord = summary.totalCount <= 1 ? leafById.get(topLevelId) : undefined;

      return [
        {
          id: `${userId}-${topLevelId}`,
          listingId: topLevelId,
          ...this.resolveListingRelation(listing, locale),
          progressSeconds: leafRecord?.positionSeconds,
          totalLeafCount: summary.totalCount,
          completedLeafCount: summary.completedCount,
          completedAt: onlyCompleted ? latestUpdatedAt.toISOString() : undefined,
        },
      ];
    });

    return { items, nextCursor };
  }

  private resolveTopLevelId(record: ProgressLeafRecord): string {
    if (!record.listing.parentId) return record.listingId;
    if (!record.listing.parent?.parentId) return record.listing.parentId;
    return record.listing.parent.parentId;
  }

  async findSaved(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: MyLibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;
    const locale = getRequestLocale();

    const records = await this.prisma.favoriteListing.findMany({
      ...(() => {
        const baseArgs = {
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take,
          include: { listing: { select: listingRelationSelect(locale) } },
        } satisfies Prisma.FavoriteListingFindManyArgs;
        return cursor
          ? {
              ...baseArgs,
              cursor: { userId_listingId: { userId, listingId: cursor } },
              skip: 1,
            }
          : baseArgs;
      })(),
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.favoriteToDto(r, locale),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.listingId : undefined;

    return { items, nextCursor };
  }

  /**
   * Rows updated since `since` (exclusive), including tombstoned (`deletedAt`
   * set) ones — mirrors `AudioRepository.getUserProgress`'s delta convention,
   * but must NOT filter out tombstones the way `findSaved` does, since a
   * client needs to see removals to reconcile its local saved list.
   */
  async findSavedDelta(userId: string, since?: Date): Promise<SavedDeltaItemDto[]> {
    const records = await this.prisma.favoriteListing.findMany({
      where: (() => {
        const where: Prisma.FavoriteListingWhereInput = { userId };
        if (since) {
          where.updatedAt = { gt: since };
        }
        return where;
      })(),
      orderBy: { updatedAt: 'desc' },
      select: { listingId: true, updatedAt: true, deletedAt: true, createdAt: true },
    });

    return records.map((record) => ({
      listingId: record.listingId,
      updatedAt: record.updatedAt.toISOString(),
      deletedAt: record.deletedAt ? record.deletedAt.toISOString() : undefined,
      savedAt: record.deletedAt ? undefined : record.createdAt.toISOString(),
    }));
  }

  /** Returns false when `slug` doesn't resolve to a real Listing (no row written). */
  async saveLecture(userId: string, slug: string): Promise<boolean> {
    const listingId = await this.resolveListingId(slug);
    if (!listingId) return false;

    await this.prisma.favoriteListing.upsert({
      where: { userId_listingId: { userId, listingId } },
      // Clears any prior tombstone (unsave then save again) and bumps updatedAt
      // on both branches so this write always wins its own LWW comparison.
      create: { userId, listingId, deletedAt: null },
      update: { deletedAt: null, updatedAt: new Date() },
    });
    return true;
  }

  /**
   * Soft-deletes (tombstones) rather than physically deleting, so the removal
   * survives to be seen by `findSavedDelta` — a hard delete would make the row
   * silently vanish from a `since` query with no trace for other devices to
   * reconcile. Returns false when `slug` doesn't resolve to a real Listing (no
   * row touched); a no-op (0 rows matched) when the listing was never saved.
   */
  async unsaveLecture(userId: string, slug: string): Promise<boolean> {
    const listingId = await this.resolveListingId(slug);
    if (!listingId) return false;

    await this.prisma.favoriteListing.updateMany({
      where: { userId, listingId },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
    return true;
  }

  private async resolveListingId(slug: string): Promise<string | null> {
    const listing = await this.prisma.listing.findFirst({
      where: { slug },
      select: { id: true },
    });
    return listing?.id ?? null;
  }

  /**
   * Raw-SQL upsert per item, LWW on `updatedAt` — mirrors
   * `AudioRepository.bulkSync`'s pattern, but plain LWW rather than monotonic:
   * unlike progress's `isCompleted`, a later unsave must be able to override
   * an earlier save and vice versa, so `deletedAt` and `updatedAt` are decided
   * together by whichever write is newer, not OR-guarded.
   */
  async bulkSync(userId: string, items: SavedSyncItemDto[]): Promise<void> {
    if (items.length === 0) return;

    const operations = items.map((item) => {
      const clientUpdatedAt = new Date(item.updatedAt);
      const deletedAt = item.saved ? null : clientUpdatedAt;

      return this.prisma.$executeRaw`
        INSERT INTO "FavoriteListing" ("userId", "listingId", "createdAt", "updatedAt", "deletedAt")
        VALUES (${userId}, ${item.listingId}::uuid, ${clientUpdatedAt}, ${clientUpdatedAt}, ${deletedAt})
        ON CONFLICT ("userId", "listingId")
        DO UPDATE SET
          "updatedAt" = CASE
            WHEN "FavoriteListing"."updatedAt" > ${clientUpdatedAt}
            THEN "FavoriteListing"."updatedAt"
            ELSE ${clientUpdatedAt}
          END,
          "deletedAt" = CASE
            WHEN "FavoriteListing"."updatedAt" > ${clientUpdatedAt}
            THEN "FavoriteListing"."deletedAt"
            ELSE ${deletedAt}
          END
      `;
    });

    await this.prisma.$transaction(operations);
  }

  async getRecentProgress(userId: string): Promise<RecentProgressDto | null> {
    const locale = getRequestLocale();
    const record = await this.prisma.userListingProgress.findFirst({
      where: {
        userId,
        isCompleted: false,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            format: true,
            orderIndex: true,
            publishedLectureCount: true,
            language: true,
            durationSeconds: true,
            coverImageUrl: true,
            translations: {
              where: { locale, status: 'published' },
              select: { title: true },
              take: 1,
            },
            scholar: {
              select: {
                slug: true,
                name: true,
                mainLanguage: true,
                imageUrl: true,
                translations: {
                  where: { locale, status: 'published' },
                  select: { name: true },
                  take: 1,
                },
              },
            },
            parent: {
              select: {
                id: true,
                title: true,
                slug: true,
                format: true,
                orderIndex: true,
                language: true,
                parentId: true,
                translations: {
                  where: { locale, status: 'published' },
                  select: { title: true },
                  take: 1,
                },
                coverImageUrl: true,
                parent: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    format: true,
                    language: true,
                    translations: {
                      where: { locale, status: 'published' },
                      select: { title: true },
                      take: 1,
                    },
                    coverImageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!record) return null;

    return this.toRecentProgressDto(record, locale);
  }

  private toRecentProgressDto(record: RecentProgressRecord, locale: Locale): RecentProgressDto {
    const listingTitle = resolveContentTranslation({
      base: { title: record.listing.title },
      originalLanguage: record.listing.language,
      targetLocale: locale,
      publishedTranslation: record.listing.translations[0] ?? null,
    }).fields.title;
    const scholarName = resolveContentTranslation({
      base: { name: record.listing.scholar.name },
      originalLanguage: record.listing.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: record.listing.scholar.translations[0] ?? null,
    }).fields.name;
    const artworkKey = getRecentArtworkKey(record.listing);
    const parent = record.listing.parent;
    const grandparent = parent?.parent;
    const seriesContext = getRecentSeriesContext(parent, locale);
    const rootListing = getRecentRootListing(parent, grandparent, seriesContext, locale);
    const scalars = getRecentProgressScalars(record);

    return {
      lectureTitle: listingTitle,
      lectureSlug: record.listing.slug,
      listingSlug: record.listing.slug,
      format: record.listing.format,
      orderIndex: scalars.orderIndex,
      publishedLectureCount: scalars.publishedLectureCount,
      scholarName,
      scholarSlug: record.listing.scholar.slug,
      durationSeconds: scalars.durationSeconds,
      positionSeconds: record.positionSeconds,
      artworkUrl: getRecentArtworkUrl(artworkKey, (value) => this.toPublicUrl(value)),
      scholarImageUrl: scalars.scholarImageUrl,
      seriesContext,
      rootListing,
      rootFormat: grandparent?.format ?? parent?.format,
    };
  }

  private toPublicUrl(value: string): string {
    if (/^[a-z]+:\/\//i.test(value)) return value;
    const base = this.config?.ASSET_CDN_BASE_URL;
    if (!base) return value;
    return `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
  }

  /** Shared resolution of the translatable listing relation shared by the
   * progress- and favorite-backed myLibrary item shapes. */
  private resolveListingRelation(
    listing: ListingRelation,
    locale: Locale,
  ): Pick<
    MyLibraryItemDto,
    | 'listingTitle'
    | 'listingSlug'
    | 'scholarId'
    | 'scholarSlug'
    | 'scholarName'
    | 'seriesTitle'
    | 'durationSeconds'
    | 'originalLanguage'
    | 'originalListingTitle'
  > {
    const resolved = resolveContentTranslation({
      base: { title: listing.title },
      originalLanguage: listing.language,
      targetLocale: locale,
      publishedTranslation: listing.translations[0] ?? null,
    });
    const scholarName = resolveContentTranslation({
      base: { name: listing.scholar.name },
      originalLanguage: listing.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: listing.scholar.translations[0] ?? null,
    }).fields.name;
    const seriesTitle = listing.parent
      ? resolveContentTranslation({
          base: { title: listing.parent.title },
          originalLanguage: listing.parent.language,
          targetLocale: locale,
          publishedTranslation: listing.parent.translations[0] ?? null,
        }).fields.title
      : undefined;

    return {
      listingTitle: resolved.fields.title,
      listingSlug: listing.slug,
      scholarId: listing.scholar.id,
      scholarSlug: listing.scholar.slug,
      scholarName,
      seriesTitle,
      durationSeconds: listing.durationSeconds ?? undefined,
      originalLanguage: resolved.originalLanguage,
      originalListingTitle: resolved.original?.title,
    };
  }

  private favoriteToDto(
    r: Prisma.FavoriteListingGetPayload<{
      include: {
        listing: { select: ReturnType<typeof listingRelationSelect> };
      };
    }>,
    locale: Locale,
  ): MyLibraryItemDto {
    return {
      id: `${r.userId}-${r.listingId}`,
      listingId: r.listingId,
      ...this.resolveListingRelation(r.listing, locale),
      savedAt: r.createdAt.toISOString(),
    };
  }
}

function getRecentArtworkUrl(
  artworkKey: string | null | undefined,
  toPublicUrl: (value: string) => string,
): string | undefined {
  return artworkKey ? toPublicUrl(artworkKey) : undefined;
}
