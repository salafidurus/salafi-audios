import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/db/prisma.service';
import { Prisma, Status, TranslationStatus } from '@sd/core-db';
import type {
  ContentSuggestionDto,
  FeedContentItemDto,
  FeedPageDto,
  ListingFormat,
  ScholarChipDto,
  ScholarTitle,
  Locale,
} from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { ConfigService } from '../../core/config/config.service';

type RecentListingRecord = {
  format: ListingFormat;
  durationSeconds: number | null;
  publishedDurationSeconds: number | null;
  coverImageUrl: string | null;
  publishedLectureCount: number | null;
};

type RecentFeedListing = RecentListingRecord & {
  id: string;
  slug: string;
  title: string;
  language: Locale | null;
  publishedAt: Date | null;
  createdAt: Date;
  translations: Array<{ title: string }>;
  scholar: {
    name: string;
    slug: string;
    title: ScholarTitle | null;
    imageUrl: string | null;
    mainLanguage: Locale;
    translations: Array<{ name: string }>;
  };
};

function recentListingPresentation(
  record: RecentListingRecord,
  toPublicUrl: (value: string) => string | undefined,
) {
  return {
    durationSeconds: listingDuration(record),
    thumbnailUrl: listingThumbnail(record, toPublicUrl),
    publishedLectureCount: listingLectureCount(record),
  };
}

function listingDuration(record: RecentListingRecord): number {
  return record.format === 'single'
    ? (record.durationSeconds ?? 0)
    : (record.publishedDurationSeconds ?? 0);
}

function listingThumbnail(
  record: RecentListingRecord,
  toPublicUrl: (value: string) => string | undefined,
): string | null | undefined {
  return record.format === 'single' ? null : toPublicUrl(record.coverImageUrl ?? '');
}

function listingLectureCount(record: RecentListingRecord): number {
  return record.format === 'single' ? 1 : (record.publishedLectureCount ?? 1);
}

function buildRecentContentItem(
  record: RecentFeedListing,
  resolved: {
    fields: { title: string };
    originalLanguage?: Locale;
    original?: { title: string | null } | null;
  },
  scholarName: string,
  presentation: ReturnType<typeof recentListingPresentation>,
): FeedContentItemDto {
  return {
    kind: record.format,
    id: record.id,
    title: resolved.fields.title,
    slug: record.slug,
    scholarName,
    scholarSlug: record.scholar.slug,
    scholarTitle: record.scholar.title ?? undefined,
    scholarImageUrl: record.scholar.imageUrl ?? undefined,
    thumbnailUrl: presentation.thumbnailUrl ?? null,
    durationSeconds: presentation.durationSeconds,
    publishedLectureCount: presentation.publishedLectureCount,
    publishedAt: (record.publishedAt ?? record.createdAt).toISOString(),
    originalLanguage: resolved.originalLanguage,
    original: resolved.original ? { title: resolved.original.title ?? undefined } : undefined,
  };
}

function paginateRecentListings<T>(items: T[], limit: number) {
  const hasMore = items.length > limit;
  return { hasMore, page: hasMore ? items.slice(0, limit) : items };
}

function getRecentNextCursor<T extends { createdAt: Date }>(
  page: T[],
  hasMore: boolean,
  pageNumber: number,
  encodeCursor: (date: Date, page: number) => string,
): string | undefined {
  const lastItem = page[page.length - 1];
  return hasMore && lastItem ? encodeCursor(lastItem.createdAt, pageNumber + 1) : undefined;
}

function getRecentContentLimit(pageNumber: number, limit: number): number {
  const moduleCount = pageNumber % 2 === 0 ? 2 : 0;
  return Math.max(1, limit - moduleCount);
}

function applyRecentFilters(
  where: Prisma.ListingWhereInput,
  topicSlug?: string,
  cursorDate?: Date,
) {
  if (topicSlug) where.topics = { some: { topic: { slug: topicSlug } } };
  if (cursorDate) where.createdAt = { lt: cursorDate };
}

@Injectable()
export class RecentListingsRepo {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getRecentListings(cursor?: string, limit = 20, topicSlug?: string): Promise<FeedPageDto> {
    const locale = getRequestLocale();
    const decodedCursor = this.decodeCursor(cursor);
    const cursorDate = decodedCursor?.date;
    const pageNumber = decodedCursor?.page ?? 0;

    const where: Prisma.ListingWhereInput = {
      format: { in: ['single', 'series', 'collection'] },
      status: Status.published,
      deletedAt: null,
      parentId: null,
      scholar: { isActive: true },
    };
    applyRecentFilters(where, topicSlug, cursorDate);

    const contentLimit = getRecentContentLimit(pageNumber, limit);
    const queryArgs = {
      where,
      include: {
        translations: {
          where: { locale, status: TranslationStatus.published },
          select: { title: true },
          take: 1,
        },
        scholar: {
          select: {
            name: true,
            slug: true,
            title: true,
            imageUrl: true,
            mainLanguage: true,
            translations: {
              where: { locale, status: TranslationStatus.published },
              select: { name: true },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: contentLimit + 1,
    } satisfies Prisma.ListingFindManyArgs;
    const listings = await this.prisma.listing.findMany(queryArgs);

    const { hasMore, page } = paginateRecentListings(listings, contentLimit);

    const contentItems: FeedContentItemDto[] = page.map((r) => this.toRecentContentItem(r, locale));
    const items: FeedPageDto['items'] = [...contentItems];
    await this.appendDiscoveryRows(items, page, contentItems, pageNumber, topicSlug, locale);

    const nextCursor = getRecentNextCursor(page, hasMore, pageNumber, (date, page) =>
      this.encodeCursor(date, page),
    );

    return { items, nextCursor, exhausted: !nextCursor };
  }

  private toRecentContentItem(r: RecentFeedListing, locale: Locale): FeedContentItemDto {
    const resolved = resolveContentTranslation({
      base: { title: r.title },
      originalLanguage: r.language,
      targetLocale: locale,
      publishedTranslation: r.translations[0] ?? null,
    });
    const scholarName = resolveContentTranslation({
      base: { name: r.scholar!.name },
      originalLanguage: r.scholar!.mainLanguage,
      targetLocale: locale,
      publishedTranslation: r.scholar!.translations[0] ?? null,
    }).fields.name;

    const presentation = recentListingPresentation(r, (value) => this.toOptionalPublicUrl(value));
    return buildRecentContentItem(r, resolved, scholarName, presentation);
  }
  private async appendDiscoveryRows(
    items: FeedPageDto['items'],
    page: Parameters<RecentListingsRepo['buildScholarRow']>[0],
    contentItems: FeedContentItemDto[],
    pageNumber: number,
    topicSlug: string | undefined,
    locale: Locale,
  ) {
    if (page.length === 0 || pageNumber % 2 !== 0) return;
    const scholars = this.buildScholarRow(page, locale);
    if (scholars.length > 0) items.push({ kind: 'scholar_row', scholars });

    const topicItems: ContentSuggestionDto[] = contentItems.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      kind: item.kind,
      scholarName: item.scholarName,
      scholarSlug: item.scholarSlug,
      thumbnailUrl: item.thumbnailUrl,
      durationSeconds: item.durationSeconds,
      originalLanguage: item.originalLanguage,
      original: item.original,
    }));
    if (topicItems.length > 0) {
      const topicName = topicSlug
        ? await this.resolveTopicName(topicSlug, locale)
        : 'Continue exploring';
      items.push({
        kind: 'topic_row',
        topicName,
        items: topicItems,
      });
    }
  }

  private buildScholarRow(
    listings: Array<{
      scholar: {
        name: string;
        slug: string;
        imageUrl: string | null;
        mainLanguage: Locale;
        translations: Array<{ name: string }>;
      } | null;
    }>,
    locale: Locale,
  ): ScholarChipDto[] {
    const seen = new Set<string>();
    return listings.flatMap((listing) => {
      const scholar = listing.scholar;
      if (!scholar || seen.has(scholar.slug)) return [];
      seen.add(scholar.slug);
      const resolved = resolveContentTranslation({
        base: { name: scholar.name },
        originalLanguage: scholar.mainLanguage,
        targetLocale: locale,
        publishedTranslation: scholar.translations[0] ?? null,
      });
      return [
        {
          id: scholar.slug,
          name: resolved.fields.name,
          slug: scholar.slug,
          imageUrl: scholar.imageUrl,
        },
      ];
    });
  }

  private async resolveTopicName(slug: string, locale: Locale): Promise<string> {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: {
        name: true,
        translations: {
          where: { locale },
          select: { name: true },
          take: 1,
        },
      },
    });
    return topic?.translations[0]?.name ?? topic?.name ?? slug;
  }

  private decodeCursor(cursor?: string): { date?: Date; page: number } | undefined {
    if (!cursor) return { page: 0 };
    try {
      // SAFETY: cursors are emitted by encodeCursor and contain these two fields; invalid external cursors fall through to the legacy date parser.
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as {
        date: string;
        page: number;
      };
      return { date: new Date(decoded.date), page: decoded.page };
    } catch {
      const date = new Date(cursor);
      return Number.isNaN(date.getTime()) ? undefined : { date, page: 1 };
    }
  }

  private encodeCursor(date: Date, page: number): string {
    return Buffer.from(JSON.stringify({ date: date.toISOString(), page })).toString('base64url');
  }

  private toPublicUrl(value: string): string {
    if (/^[a-z]+:\/\//i.test(value)) {
      return value;
    }

    const base = this.config.ASSET_CDN_BASE_URL;
    if (!base) {
      return value;
    }

    return `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
  }

  private toOptionalPublicUrl(value?: string | null): string | undefined {
    if (!value) return undefined;
    return this.toPublicUrl(value);
  }
}
