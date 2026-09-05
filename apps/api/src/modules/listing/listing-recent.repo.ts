import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/db/prisma.service';
import { Prisma, Status, TranslationStatus } from '@sd/core-db';
import { ExploreRecommendationSchemaVersion } from '@sd/core-contracts';
import type {
  FeedContentItemDto,
  FeedPageDto,
  ExploreListingsBatchDto,
  ExploreScholarsBatchDto,
  ExploreScholarItemDto,
  ListingFormat,
  ScholarTitle,
  Locale,
} from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { ConfigService } from '../../core/config/config.service';

/** listing application module responsible for listing recent.repo behavior at the backend boundary. */
type RecentListingRecord = {
  format: ListingFormat;
  /** Documents the durationSeconds field's API projection semantics and lifecycle meaning. */ durationSeconds:
    | number
    | null;
  /** Documents the publishedDurationSeconds field's API projection semantics and lifecycle meaning. */ publishedDurationSeconds:
    | number
    | null;
  coverImageUrl: string | null;
  publishedLectureCount: number | null;
};

type RecentFeedListing = RecentListingRecord & {
  id: string;
  /** Documents the slug field's API projection semantics and lifecycle meaning. */ slug: string;
  title: string;
  /** Documents the language field's API projection semantics and lifecycle meaning. */ language: Locale | null;
  /** Documents the publishedAt field's API projection semantics and lifecycle meaning. */ publishedAt: Date | null;
  /** Documents the createdAt field's API projection semantics and lifecycle meaning. */ createdAt: Date;
  translations: Array<{ title: string }>;
  scholar: {
    name: string;
    /** Documents the slug field's API projection semantics and lifecycle meaning. */ slug: string;
    title: ScholarTitle | null;
    imageUrl: string | null;
    /** Documents the mainLanguage field's API projection semantics and lifecycle meaning. */ mainLanguage: Locale;
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
    /** Documents the originalLanguage field's API projection semantics and lifecycle meaning. */ originalLanguage?: Locale;
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
    scholarImageUrl: record.scholar.imageUrl ?? null,
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

function applyRecentFilters(
  where: Prisma.ListingWhereInput,
  topicSlug?: string,
  cursor?: { date: Date; /** Stable tie-breaker carried by structured cursors. */ slug?: string },
) {
  if (topicSlug) where.topics = { some: { topic: { slug: topicSlug } } };
  if (cursor) {
    where.OR = cursor.slug
      ? [{ createdAt: { lt: cursor.date } }, { createdAt: cursor.date, slug: { lt: cursor.slug } }]
      : undefined;
    if (!cursor.slug) where.createdAt = { lt: cursor.date };
  }
}

function buildRecentWhere(
  topicSlug: string | undefined,
  cursor:
    | {
        date?: Date;
        /** Stable tie-breaker carried by structured cursors. */
        slug?: string;
      }
    | undefined,
): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    format: { in: ['single', 'series', 'collection'] },
    status: Status.published,
    deletedAt: null,
    parentId: null,
    scholar: { isActive: true },
  };
  applyRecentFilters(
    where,
    topicSlug,
    cursor?.date ? { date: cursor.date, slug: cursor.slug } : undefined,
  );
  return where;
}

function encodeNextCursor<
  T extends {
    /** Timestamp used as the primary cursor ordering key. */
    createdAt: Date;
    /** Stable public identity used to break timestamp ties. */
    slug: string;
  },
>(
  hasMore: boolean,
  lastItem: T | undefined,
  encode: (date: Date, slug: string) => string,
): string | undefined {
  return hasMore && lastItem ? encode(lastItem.createdAt, lastItem.slug) : undefined;
}

function buildListingsBatch(
  items: FeedContentItemDto[],
  topicSlug: string | undefined,
  topicLabel: string | undefined,
): ExploreListingsBatchDto | undefined {
  if (items.length === 0) return undefined;
  return {
    kind: 'listings',
    id: topicSlug ? `listings:topic:${topicSlug}` : 'listings:recent',
    title: topicSlug
      ? { kind: 'topic_listings', topicSlug, label: topicLabel ?? topicSlug }
      : { kind: 'listings', id: 'recent', label: topicLabel ?? listingsTitleLabel('en') },
    reason: 'deterministic_recent',
    items,
  };
}

function seniorScholarsTitleLabel(locale: Locale): string {
  return locale === 'ar' ? 'العلماء الكبار' : 'Senior Scholars';
}

function buildSeniorScholarsBatch(
  items: ExploreScholarItemDto[],
  locale: Locale,
): ExploreScholarsBatchDto | undefined {
  if (items.length === 0) return undefined;
  return {
    kind: 'scholars',
    id: 'scholars:senior',
    title: {
      kind: 'scholars',
      id: 'senior_scholars',
      label: seniorScholarsTitleLabel(locale),
    },
    reason: 'deterministic_senior_scholars',
    items,
  };
}

function listingsTitleLabel(locale: Locale): string {
  return locale === 'ar' ? 'مواصلة الاستكشاف' : 'Continue exploring';
}

async function findRecentListings(
  prisma: PrismaService,
  where: Prisma.ListingWhereInput,
  locale: Locale,
  limit: number,
) {
  return prisma.listing.findMany({
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
    orderBy: [{ createdAt: 'desc' }, { slug: 'desc' }],
    take: limit + 1,
  } satisfies Prisma.ListingFindManyArgs);
}

async function findSeniorScholars(prisma: PrismaService, locale: Locale) {
  return prisma.scholar.findMany({
    where: { title: 'allamah', isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
      mainLanguage: true,
      title: true,
      translations: {
        where: { locale, status: TranslationStatus.published },
        select: { name: true },
        take: 1,
      },
      _count: {
        select: {
          listings: {
            where: {
              format: 'single',
              status: Status.published,
              deletedAt: null,
            },
          },
        },
      },
    },
    orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
    take: 20,
  });
}

@Injectable()
/** NestJS recent listings repo service or controller coordinating the API boundary for this responsibility. */
export class RecentListingsRepo {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getRecentListings(cursor?: string, limit = 20, topicSlug?: string): Promise<FeedPageDto> {
    const locale = getRequestLocale();
    const decodedCursor = this.decodeCursor(cursor);

    const listings = await findRecentListings(
      this.prisma,
      buildRecentWhere(topicSlug, decodedCursor),
      locale,
      limit,
    );

    const { hasMore, page } = paginateRecentListings(listings, limit);

    const contentItems: FeedContentItemDto[] = page.map((r) => this.toRecentContentItem(r, locale));
    const batch = buildListingsBatch(
      contentItems,
      topicSlug,
      await this.resolveListingsTitle(topicSlug, locale),
    );

    const seniorScholars = cursor ? [] : await findSeniorScholars(this.prisma, locale);
    const scholarBatch = buildSeniorScholarsBatch(
      seniorScholars.map((scholar) => {
        const resolved = resolveContentTranslation({
          base: { name: scholar.name },
          originalLanguage: scholar.mainLanguage,
          targetLocale: locale,
          publishedTranslation: scholar.translations[0] ?? null,
        });
        return {
          id: scholar.id,
          slug: scholar.slug,
          name: resolved.fields.name,
          imageUrl: scholar.imageUrl ?? undefined,
          mainLanguage: scholar.mainLanguage ?? undefined,
          originalLanguage: resolved.originalLanguage,
          original: resolved.original ? { name: resolved.original.name } : undefined,
          title: scholar.title ?? undefined,
          lectureCount: scholar._count.listings,
        };
      }),
      locale,
    );

    const lastItem = page.at(-1);
    const nextCursor = encodeNextCursor(hasMore, lastItem, (date, slug) =>
      this.encodeCursor(date, slug),
    );

    return {
      schemaVersion: ExploreRecommendationSchemaVersion,
      batches: [batch, scholarBatch].filter(
        (candidate): candidate is ExploreListingsBatchDto | ExploreScholarsBatchDto =>
          candidate !== undefined,
      ),
      nextCursor,
      exhausted: !nextCursor,
    };
  }

  private async resolveListingsTitle(
    topicSlug: string | undefined,
    locale: Locale,
  ): Promise<string | undefined> {
    return topicSlug ? this.resolveTopicName(topicSlug, locale) : listingsTitleLabel(locale);
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

  private decodeCursor(cursor?: string):
    | {
        date?: Date;
        /** Stable tie-breaker emitted with structured cursors. */
        slug?: string;
      }
    | undefined {
    if (!cursor) return undefined;
    try {
      // SAFETY: cursors are emitted by encodeCursor and contain these two fields; invalid external cursors fall through to the legacy date parser.
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as {
        date: string;
        /** Stable tie-breaker emitted with structured cursors. */
        slug?: string;
      };
      return { date: new Date(decoded.date), slug: decoded.slug };
    } catch {
      const date = new Date(cursor);
      return Number.isNaN(date.getTime()) ? undefined : { date };
    }
  }

  private encodeCursor(date: Date, slug: string): string {
    return Buffer.from(JSON.stringify({ date: date.toISOString(), slug })).toString('base64url');
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
