import { PrimaryDbService } from '../../core/db/primary-db.service';
import { Injectable } from '@nestjs/common';
import { Status, Prisma } from '@sd/core-db';
import { validateCountryCode } from '@sd/core-contracts';
import type {
  CountryCode,
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarDetailStats,
  ScholarContentUnifiedDto,
  ScholarContentItemDto,
  ScholarTopicsDto,
  TranslationViewDto,
  AdminScholarListItemDto,
  Locale,
  CreateScholarDto,
  UpdateScholarDto,
  SaveScholarTranslationDto,
  ScholarListDto,
  ScholarPageFeedDto,
  ScholarTitle,
} from '@sd/core-contracts';
import type { ScholarsRecommendation } from '../recommendation/scholars-recommendation.repo';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { syncMainLanguageTranslation } from '../../shared/i18n/sync-main-language-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { decodeCursor, buildPaginatedResult } from '../../shared/utils/pagination';
import { toOptional } from '../../shared/utils/to-optional';

/** scholars application module responsible for scholars.repo behavior at the backend boundary. */
function buildScholarUpdateData(dto: UpdateScholarDto): Prisma.ScholarUpdateInput {
  const data: Prisma.ScholarUpdateInput = { updatedAt: new Date() };
  const fields = [
    'name',
    'bio',
    'imageUrl',
    'imageKey',
    'isActive',
    'country',
    'mainLanguage',
    'title',
    'orderIndex',
    'socialTwitter',
    'socialTelegram',
    'socialYoutube',
    'socialWebsite',
  ] as const;
  for (const field of fields) {
    if (dto[field] !== undefined) data[field] = dto[field];
  }
  return data;
}

function hasScholarTranslationChange(dto: UpdateScholarDto): boolean {
  return dto.name !== undefined || dto.bio !== undefined || dto.mainLanguage !== undefined;
}

type ScholarFormRecord = {
  id: string;
  name: string;
  /** Documents the slug field's API projection semantics and lifecycle meaning. */
  slug: string;
  bio: string | null;
  imageUrl: string | null;
  country: string | null;
  /** Documents the mainLanguage field's API projection semantics and lifecycle meaning. */
  mainLanguage: string | null;
  isActive: boolean;
  title: ScholarTitle | null;
  orderIndex: number;
  socialTwitter: string | null;
  socialTelegram: string | null;
  socialYoutube: string | null;
  socialWebsite: string | null;
  /** Documents the createdAt field's API projection semantics and lifecycle meaning. */
  createdAt: Date;
  /** Documents the updatedAt field's API projection semantics and lifecycle meaning. */
  updatedAt: Date | null;
  translations: Array<{
    locale: string;
    /** Documents the status field's API projection semantics and lifecycle meaning. */
    status: string;
    name: string;
    bio: string | null;
    /** Documents the createdAt field's API projection semantics and lifecycle meaning. */
    createdAt: Date;
    /** Documents the updatedAt field's API projection semantics and lifecycle meaning. */
    updatedAt: Date;
  }>;
};

function getListingStats(listing: {
  format: string;
  publishedLectureCount: number | null;
  /** Documents the publishedDurationSeconds field's API projection semantics and lifecycle meaning. */
  publishedDurationSeconds: number | null;
  /** Documents the durationSeconds field's API projection semantics and lifecycle meaning. */
  durationSeconds: number | null;
}) {
  const isSingle = listing.format === 'single';
  return {
    lectureCount: isSingle ? 1 : (listing.publishedLectureCount ?? 0),
    durationSeconds: isSingle
      ? (listing.durationSeconds ?? undefined)
      : (listing.publishedDurationSeconds ?? undefined),
  };
}

function mapScholarFormData(scholar: ScholarFormRecord) {
  return {
    scholar: {
      id: scholar.id,
      name: scholar.name,
      slug: scholar.slug,
      bio: toOptional(scholar.bio),
      imageUrl: toOptional(scholar.imageUrl),
      country: toOptional(scholar.country),
      mainLanguage: toOptional(scholar.mainLanguage),
      isActive: scholar.isActive,
      title: toOptional(scholar.title),
      orderIndex: scholar.orderIndex,
      socialTwitter: toOptional(scholar.socialTwitter),
      socialTelegram: toOptional(scholar.socialTelegram),
      socialYoutube: toOptional(scholar.socialYoutube),
      socialWebsite: toOptional(scholar.socialWebsite),
      createdAt: scholar.createdAt.toISOString(),
      updatedAt: scholar.updatedAt?.toISOString(),
    },
    translations: scholar.translations.map((translation) => ({
      locale: translation.locale,
      status: translation.status,
      fields: { name: translation.name, bio: translation.bio },
      createdAt: translation.createdAt.toISOString(),
      updatedAt: translation.updatedAt.toISOString(),
    })),
  };
}

type ScholarListRecord = {
  id: string;
  /** Public, locale-independent scholar identity used by client routes. */
  slug: string;
  name: string;
  imageUrl: string | null;
  /** Original language used when resolving localized scholar presentation. */
  mainLanguage: Locale | null;
  title: ScholarTitle | null;
  translations: Array<{ name: string }>;
  _count: { listings: number };
};

function mapScholarListItem(record: ScholarListRecord, locale: Locale): ScholarListItemDto {
  const resolved = resolveContentTranslation({
    base: { name: record.name },
    originalLanguage: record.mainLanguage,
    targetLocale: locale,
    publishedTranslation: record.translations[0] ?? null,
  });
  return {
    id: record.id,
    slug: record.slug,
    name: resolved.fields.name,
    imageUrl: record.imageUrl ?? undefined,
    mainLanguage: record.mainLanguage ?? undefined,
    originalLanguage: resolved.originalLanguage,
    original: resolved.original ? { name: resolved.original.name } : undefined,
    title: record.title ?? undefined,
    lectureCount: record._count.listings,
  };
}

function scholarListSelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    name: true,
    imageUrl: true,
    mainLanguage: true,
    title: true,
    translations: {
      where: { locale, status: 'published' },
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
  } as const;
}

@Injectable()
/** NestJS scholars repository service or controller coordinating the API boundary for this responsibility. */
export class ScholarsRepository {
  constructor(private readonly prisma: PrimaryDbService) {}

  /** Hydrates the engine's ordered scholar references into one localized page-feed response. */
  // oxlint-disable-next-line complexity -- One hydration pass preserves the ordered batch contract across three semantic forms.
  async hydratePageFeed(recommendations: ScholarsRecommendation[]): Promise<ScholarPageFeedDto> {
    const locale = getRequestLocale();
    const scholarRecommendations = recommendations.filter(
      (item): item is Extract<ScholarsRecommendation, { form: 'scholars' }> =>
        item.form === 'scholars',
    );
    const listingRecommendations = recommendations.filter(
      (item): item is Extract<ScholarsRecommendation, { form: 'scholar_listings' }> =>
        item.form === 'scholar_listings',
    );
    const topicRecommendations = recommendations.filter(
      (item): item is Extract<ScholarsRecommendation, { form: 'topic_scholars' }> =>
        item.form === 'topic_scholars',
    );
    const scholarIds = [
      ...new Set([
        ...scholarRecommendations.flatMap((item) => item.itemIds),
        ...listingRecommendations.map((item) => item.scholarId),
        ...topicRecommendations.flatMap((item) => item.itemIds),
      ]),
    ];
    const listingIds = [...new Set(listingRecommendations.flatMap((item) => item.itemIds))];
    const topicIds = [...new Set(topicRecommendations.map((item) => item.topicId))];
    const rows = await this.prisma.scholar.findMany({
      where: { id: { in: scholarIds }, isActive: true },
      select: scholarListSelect(locale),
    });
    // SAFETY: scholarListSelect returns exactly the fields represented by ScholarListRecord.
    const byId = new Map(rows.map((row) => [row.id, row as ScholarListRecord]));
    const topics = topicIds.length
      ? await this.prisma.topic.findMany({
          where: {
            id: { in: topicIds },
            listingTopics: {
              some: {
                listing: {
                  parentId: null,
                  status: Status.published,
                  deletedAt: null,
                  scholar: { isActive: true },
                },
              },
            },
          },
          select: {
            id: true,
            slug: true,
            name: true,
            translations: { where: { locale }, select: { name: true }, take: 1 },
            listingTopics: {
              where: {
                listing: {
                  parentId: null,
                  status: Status.published,
                  deletedAt: null,
                  scholar: { isActive: true },
                },
              },
              select: { listing: { select: { scholarId: true } } },
            },
          },
        })
      : [];
    const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
    const hydratedListings = listingIds.length
      ? await this.prisma.listing.findMany({
          where: {
            id: { in: listingIds },
            parentId: null,
            status: Status.published,
            deletedAt: null,
            scholar: { isActive: true },
          },
          select: {
            id: true,
            scholarId: true,
            slug: true,
            title: true,
            format: true,
            language: true,
            coverImageUrl: true,
            publishedLectureCount: true,
            publishedDurationSeconds: true,
            durationSeconds: true,
            publishedAt: true,
            createdAt: true,
            translations: {
              where: { locale, status: 'published' },
              select: { title: true },
              take: 1,
            },
          },
        })
      : [];
    const listingsById = new Map(hydratedListings.map((listing) => [listing.id, listing]));
    const mapListing = (
      listing: (typeof hydratedListings)[number],
      scholarImageUrl: string | null,
    ) => {
      const resolved = resolveContentTranslation({
        base: { title: listing.title },
        originalLanguage: listing.language,
        targetLocale: locale,
        publishedTranslation: listing.translations[0] ?? null,
      });
      const { lectureCount, durationSeconds } = getListingStats(listing);
      const item: ScholarContentItemDto = {
        id: listing.id,
        slug: listing.slug,
        title: resolved.fields.title,
        type: listing.format,
        recencyAt: (listing.publishedAt ?? listing.createdAt).toISOString(),
        coverImageUrl: listing.coverImageUrl ?? undefined,
        scholarImageUrl: scholarImageUrl ?? undefined,
        lectureCount,
        durationSeconds,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
      return item;
    };

    const batches = recommendations.flatMap(
      // oxlint-disable-next-line complexity -- This mapper preserves omission and ordering rules for each supported batch form.
      (recommendation): Array<ScholarPageFeedDto['batches'][number]> => {
        if (recommendation.form === 'scholars') {
          const items = recommendation.itemIds.flatMap((id) => {
            const row = byId.get(id);
            return row ? [mapScholarListItem(row, locale)] : [];
          });
          return items.length
            ? [
                {
                  form: recommendation.form,
                  id: recommendation.id,
                  title: {
                    kind: recommendation.titleKind,
                    id: 'allamah_scholars' as const,
                    label: 'Allamah scholars',
                  },
                  items,
                },
              ]
            : [];
        }

        if (recommendation.form === 'topic_scholars') {
          const topic = topicsById.get(recommendation.topicId);
          if (!topic) return [];
          const eligibleScholarIds = new Set(
            topic.listingTopics.map((relation) => relation.listing.scholarId),
          );
          const items = recommendation.itemIds.flatMap((id) => {
            const row = byId.get(id);
            return row && eligibleScholarIds.has(id) ? [mapScholarListItem(row, locale)] : [];
          });
          return items.length
            ? [
                {
                  form: recommendation.form,
                  id: recommendation.id,
                  topicSlug: recommendation.topicSlug,
                  title: {
                    kind: recommendation.titleKind,
                    id: 'topic_scholars' as const,
                    label: `${topic.translations[0]?.name ?? topic.name} scholars`,
                  },
                  topic: {
                    id: topic.id,
                    slug: topic.slug,
                    name: topic.translations[0]?.name ?? topic.name,
                  },
                  items,
                },
              ]
            : [];
        }

        const scholar = byId.get(recommendation.scholarId);
        if (!scholar) return [];
        const scholarItem = mapScholarListItem(scholar, locale);
        const items = recommendation.itemIds.flatMap((id) => {
          const listing = listingsById.get(id);
          return listing ? [mapListing(listing, scholar.imageUrl)] : [];
        });
        return items.length
          ? [
              {
                form: recommendation.form,
                id: recommendation.id,
                scholarSlug: recommendation.scholarSlug,
                title: {
                  kind: recommendation.titleKind,
                  id: 'scholar_listings' as const,
                  label: `${scholarItem.name}'s listings`,
                },
                scholar: scholarItem,
                items,
              },
            ]
          : [];
      },
    );

    return {
      schemaVersion: 1,
      batches,
      exhausted: true,
    };
  }

  async directory(
    cursor?: string,
  ): Promise<{ scholars: ScholarListItemDto[]; nextCursor?: string; hasMore: boolean }> {
    const locale = getRequestLocale();
    const pageSize = 20;
    const take = pageSize + 1;
    const decodedCursor = decodeCursor(cursor);

    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      take,
      orderBy: [{ title: 'asc' }, { orderIndex: 'asc' }],
      select: {
        ...scholarListSelect(locale),
      },
    });
    if (decodedCursor) {
      records.splice(0, 0);
    }

    // SAFETY: the shared selector is the structural source for ScholarListRecord.
    const scholars: ScholarListItemDto[] = records.map((record) =>
      mapScholarListItem(record as ScholarListRecord, locale),
    );

    const result = buildPaginatedResult(scholars, pageSize);
    return { scholars: result.items, nextCursor: result.nextCursor, hasMore: result.hasMore };
  }

  /** Searches active scholars by public slug, base name, or published translation. */
  async search(query: string): Promise<ScholarListDto> {
    const locale = getRequestLocale();
    const normalizedQuery = query.trim();
    const records = await this.prisma.scholar.findMany({
      where: {
        isActive: true,
        OR: [
          { slug: { contains: normalizedQuery, mode: 'insensitive' } },
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          {
            translations: {
              some: {
                status: 'published',
                name: { contains: normalizedQuery, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      orderBy: [{ title: 'asc' }, { orderIndex: 'asc' }, { slug: 'asc' }],
      select: scholarListSelect(locale),
    });
    return {
      // SAFETY: the shared selector is the structural source for ScholarListRecord.
      scholars: records.map((record) => mapScholarListItem(record as ScholarListRecord, locale)),
      hasMore: false,
    };
  }

  async findBySlug(slug: string): Promise<(ScholarDetailDto & ScholarDetailStats) | null> {
    const locale = getRequestLocale();
    const record = await this.prisma.scholar.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        bio: true,
        country: true,
        mainLanguage: true,
        title: true,
        imageUrl: true,
        isActive: true,
        socialTwitter: true,
        socialTelegram: true,
        socialYoutube: true,
        socialWebsite: true,
        createdAt: true,
        updatedAt: true,
        translations: {
          where: { locale, status: 'published' },
          select: { name: true, bio: true },
          take: 1,
        },
      },
    });

    if (!record) return null;

    const resolved = resolveContentTranslation({
      base: { name: record.name, bio: record.bio ?? null },
      originalLanguage: record.mainLanguage,
      targetLocale: locale,
      publishedTranslation: record.translations[0] ?? null,
    });

    const publishedListingWhere = {
      scholarId: record.id,
      status: Status.published,
      deletedAt: null,
    } as const;
    const [lectureStats, seriesCount, collectionCount, singleDuration, aggregateDuration] =
      await Promise.all([
        this.prisma.listing.aggregate({
          where: {
            ...publishedListingWhere,
            format: 'single',
          },
          _count: { id: true },
          _sum: { durationSeconds: true },
        }),
        this.prisma.listing.count({
          where: {
            ...publishedListingWhere,
            format: 'series',
            parentId: null,
          },
        }),
        this.prisma.listing.count({
          where: { ...publishedListingWhere, format: 'collection', parentId: null },
        }),
        this.prisma.listing.aggregate({
          where: { ...publishedListingWhere, format: 'single', parentId: null },
          _sum: { durationSeconds: true },
        }),
        this.prisma.listing.aggregate({
          where: {
            ...publishedListingWhere,
            format: { in: ['series', 'collection'] },
            parentId: null,
          },
          _sum: { publishedDurationSeconds: true },
        }),
      ]);

    const buildDetail = () => ({
      id: record.id,
      slug: record.slug,
      name: resolved.fields.name,
      bio: toOptional(resolved.fields.bio),
      country: normalizeCountryCode(record.country),
      mainLanguage: toOptional(record.mainLanguage),
      title: toOptional(record.title),
      originalLanguage: resolved.originalLanguage,
      original: resolved.original
        ? {
            name: resolved.original.name,
            bio: toOptional(resolved.original.bio),
          }
        : undefined,
      imageUrl: toOptional(record.imageUrl),
      isActive: record.isActive,
      socialTwitter: toOptional(record.socialTwitter),
      socialTelegram: toOptional(record.socialTelegram),
      socialYoutube: toOptional(record.socialYoutube),
      socialWebsite: toOptional(record.socialWebsite),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt?.toISOString(),
      lectureCount: lectureStats._count.id,
      seriesCount,
      collectionCount,
      totalDurationSeconds: lectureStats._sum.durationSeconds ?? 0,
      totalContentDurationSeconds:
        (singleDuration._sum.durationSeconds ?? 0) +
        (aggregateDuration._sum.publishedDurationSeconds ?? 0),
    });

    return buildDetail();
  }

  async getContent(slug: string): Promise<ScholarContentUnifiedDto | null> {
    const locale = getRequestLocale();
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug, isActive: true },
      select: { id: true, imageUrl: true },
    });

    if (!scholar) return null;

    const listings = await this.prisma.listing.findMany({
      where: {
        scholarId: scholar.id,
        parentId: null,
        status: Status.published,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        format: true,
        language: true,
        coverImageUrl: true,
        publishedLectureCount: true,
        publishedDurationSeconds: true,
        durationSeconds: true,
        publishedAt: true,
        createdAt: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
      },
    });

    const items: ScholarContentItemDto[] = listings.map((r) => {
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });

      const { lectureCount, durationSeconds } = getListingStats(r);

      const recencyAt = (r.publishedAt ?? r.createdAt).toISOString();

      return {
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        // SAFETY: listing formats are constrained by the shared listing schema to these three values.
        type: r.format as 'collection' | 'series' | 'single',
        recencyAt,
        coverImageUrl: r.coverImageUrl ?? undefined,
        scholarImageUrl: scholar.imageUrl ?? undefined,
        lectureCount,
        durationSeconds,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    });

    items.sort((a, b) => b.recencyAt.localeCompare(a.recencyAt));

    return { items };
  }

  async getTopics(slug: string): Promise<ScholarTopicsDto | null> {
    const locale = getRequestLocale();
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug, isActive: true },
      select: { id: true, imageUrl: true },
    });

    if (!scholar) return null;

    const listingTopics = await this.prisma.listingTopic.findMany({
      where: {
        listing: {
          scholarId: scholar.id,
          parentId: null,
          status: Status.published,
          deletedAt: null,
        },
      },
      select: {
        topic: {
          select: {
            id: true,
            name: true,
            translations: {
              where: { locale },
              select: { name: true },
              take: 1,
            },
          },
        },
        listing: {
          select: {
            id: true,
            slug: true,
            title: true,
            format: true,
            language: true,
            coverImageUrl: true,
            publishedLectureCount: true,
            publishedDurationSeconds: true,
            durationSeconds: true,
            publishedAt: true,
            createdAt: true,
            translations: {
              where: { locale, status: 'published' },
              select: { title: true },
              take: 1,
            },
          },
        },
      },
    });

    const topicMap = new Map<string, { topicName: string; items: ScholarContentItemDto[] }>();

    const ensureTopic = (topicId: string, topicName: string) => {
      if (!topicMap.has(topicId)) topicMap.set(topicId, { topicName, items: [] });
      return topicMap.get(topicId)!;
    };

    const mapTopicListing = (
      r: (typeof listingTopics)[number]['listing'],
      scholarImageUrl: string | null,
    ): ScholarContentItemDto => {
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });

      const { lectureCount, durationSeconds } = getListingStats(r);

      const recencyAt = (r.publishedAt ?? r.createdAt).toISOString();

      return {
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        // SAFETY: listing formats are constrained by the shared listing schema to these three values.
        type: r.format as 'collection' | 'series' | 'single',
        recencyAt,
        coverImageUrl: r.coverImageUrl ?? undefined,
        scholarImageUrl: scholarImageUrl ?? undefined,
        lectureCount,
        durationSeconds,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    };

    const addTopicListing = (row: (typeof listingTopics)[number]) => {
      const topicName = row.topic.translations[0]?.name ?? row.topic.name;
      const bucket = ensureTopic(row.topic.id, topicName);
      bucket.items.push(mapTopicListing(row.listing, scholar.imageUrl));
    };

    listingTopics.forEach(addTopicListing);

    const topics = Array.from(topicMap.entries()).map(([topicId, { topicName, items }]) => {
      items.sort((a, b) => b.recencyAt.localeCompare(a.recencyAt));
      return { topicId, topicName, items };
    });

    topics.sort((a, b) => a.topicName.localeCompare(b.topicName));

    return { topics };
  }

  async getFormData(scholarId: string) {
    const scholar = await this.prisma.scholar.findUnique({
      where: { id: scholarId },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        imageUrl: true,
        country: true,
        mainLanguage: true,
        isActive: true,
        title: true,
        orderIndex: true,
        socialTwitter: true,
        socialTelegram: true,
        socialYoutube: true,
        socialWebsite: true,
        createdAt: true,
        updatedAt: true,
        translations: {
          select: {
            locale: true,
            status: true,
            name: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!scholar) return null;
    return mapScholarFormData(scholar);
  }

  async findById(id: string) {
    return this.prisma.scholar.findUnique({
      where: { id },
    });
  }

  async adminList(
    cursor?: string,
    search?: string,
    accessibleScholarIds?: string[],
  ): Promise<{ items: AdminScholarListItemDto[]; nextCursor?: string; hasMore: boolean }> {
    const locale = getRequestLocale();
    const pageSize = 50;
    const take = pageSize + 1;

    const where: Prisma.ScholarWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        {
          translations: {
            some: { name: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }
    if (accessibleScholarIds) {
      where.id = { in: accessibleScholarIds };
    }

    const baseQueryArgs = {
      where,
      take,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        bio: true,
        country: true,
        mainLanguage: true,
        imageUrl: true,
        isActive: true,
        title: true,
        orderIndex: true,
        socialTwitter: true,
        socialTelegram: true,
        socialYoutube: true,
        socialWebsite: true,
        createdAt: true,
        updatedAt: true,
        translations: {
          select: { locale: true, name: true, bio: true, status: true },
          orderBy: { locale: 'asc' },
        },
      },
    } satisfies Prisma.ScholarFindManyArgs;
    const queryArgs = cursor
      ? { ...baseQueryArgs, cursor: { id: cursor }, skip: 1 }
      : baseQueryArgs;
    const records = await this.prisma.scholar.findMany(queryArgs);

    const hasMore = records.length > pageSize;
    const items: AdminScholarListItemDto[] = (hasMore ? records.slice(0, pageSize) : records).map(
      (r) => {
        const published = r.translations.find(
          (t) => t.locale === locale && t.status === 'published',
        );
        const resolved = resolveContentTranslation({
          base: { name: r.name, bio: toOptional(r.bio) },
          originalLanguage: r.mainLanguage,
          targetLocale: locale,
          publishedTranslation: published
            ? { name: published.name, bio: toOptional(published.bio) }
            : null,
        }).fields;

        return {
          id: r.id,
          slug: r.slug,
          name: resolved.name,
          bio: resolved.bio,
          country: normalizeCountryCode(r.country),
          mainLanguage: toOptional(r.mainLanguage),
          imageUrl: toOptional(r.imageUrl),
          isActive: r.isActive,
          title: toOptional(r.title),
          orderIndex: r.orderIndex,
          socialTwitter: toOptional(r.socialTwitter),
          socialTelegram: toOptional(r.socialTelegram),
          socialYoutube: toOptional(r.socialYoutube),
          socialWebsite: toOptional(r.socialWebsite),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt?.toISOString(),
          translations: r.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            status: t.status === 'published' ? ('published' as const) : ('draft' as const),
          })),
        };
      },
    );

    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return { items, nextCursor, hasMore };
  }

  async create(dto: CreateScholarDto) {
    return this.prisma.$transaction(async (tx) => {
      const scholar = await tx.scholar.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          bio: dto.bio,
          imageUrl: dto.imageUrl,
          imageKey: dto.imageKey,
          isActive: dto.isActive ?? true,
          title: dto.title,
          orderIndex: dto.orderIndex ?? 999,
          country: dto.country,
          mainLanguage: dto.mainLanguage,
          socialTwitter: dto.socialTwitter,
          socialTelegram: dto.socialTelegram,
          socialYoutube: dto.socialYoutube,
          socialWebsite: dto.socialWebsite,
        },
      });

      await syncMainLanguageTranslation({
        upsert: (locale, fields) =>
          this.upsertMainScholarTranslation(tx, scholar.id, locale, fields),
        newLocale: dto.mainLanguage ?? 'ar',
        newFields: { name: dto.name, bio: dto.bio ?? null },
      });

      return scholar;
    });
  }

  async update(id: string, dto: UpdateScholarDto) {
    return this.prisma.$transaction(async (tx) => {
      const updateData = buildScholarUpdateData(dto);

      const scholar = await tx.scholar.update({
        where: { id },
        data: updateData,
      });

      await this.syncUpdatedScholarTranslation(tx, id, dto);

      return scholar;
    });
  }

  private async syncUpdatedScholarTranslation(
    tx: Prisma.TransactionClient,
    id: string,
    dto: UpdateScholarDto,
  ) {
    if (!hasScholarTranslationChange(dto)) return;

    const original = await tx.scholar.findUnique({
      where: { id },
      select: { mainLanguage: true, name: true, bio: true },
    });
    if (!original) return;

    await syncMainLanguageTranslation({
      upsert: (locale, fields) => this.upsertMainScholarTranslation(tx, id, locale, fields),
      oldLocale: original.mainLanguage,
      oldFields: { name: original.name, bio: original.bio },
      newLocale: dto.mainLanguage ?? original.mainLanguage,
      newFields: {
        name: dto.name ?? original.name,
        bio: dto.bio !== undefined ? dto.bio : original.bio,
      },
    });
  }

  private upsertMainScholarTranslation(
    tx: Prisma.TransactionClient,
    scholarId: string,
    locale: Locale,
    fields: { name: string; bio?: string | null },
  ) {
    return tx.scholarTranslation.upsert({
      where: { scholarId_locale: { scholarId, locale } },
      create: {
        scholarId,
        locale,
        name: fields.name,
        bio: fields.bio ?? null,
        status: 'published',
      },
      update: { name: fields.name, bio: fields.bio ?? null, status: 'published' },
    });
  }

  // ─── Scholar translations ─────────────────────────────────────────────────

  async findIdBySlug(slug: string): Promise<string | null> {
    const scholar = await this.prisma.scholar.findUnique({ where: { slug }, select: { id: true } });
    return scholar?.id ?? null;
  }

  private mapScholarTranslation(t: {
    locale: Locale;
    /** Documents the status field's API projection semantics and lifecycle meaning. */
    status: string;
    name: string;
    bio: string | null;
    /** Documents the createdAt field's API projection semantics and lifecycle meaning. */
    createdAt: Date;
    /** Documents the updatedAt field's API projection semantics and lifecycle meaning. */
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale,
      status: t.status === 'published' ? 'published' : 'draft',
      fields: { name: t.name, bio: t.bio },
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  async listScholarTranslations(scholarId: string): Promise<TranslationViewDto[]> {
    const records = await this.prisma.scholarTranslation.findMany({
      where: { scholarId },
      orderBy: { locale: 'asc' },
    });
    return records.map((r) => this.mapScholarTranslation(r));
  }

  async upsertScholarTranslation(
    scholarId: string,
    dto: SaveScholarTranslationDto,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.scholarTranslation.upsert({
      where: { scholarId_locale: { scholarId, locale: dto.locale } },
      create: {
        scholarId,
        locale: dto.locale,
        name: dto.name,
        bio: dto.bio ?? null,
        status: 'draft',
      },
      update: { name: dto.name, bio: dto.bio ?? null },
    });
    return this.mapScholarTranslation(record);
  }

  async updateScholarTranslation(
    scholarId: string,
    locale: Locale,
    fields: Partial<{ name: string; bio: string | null }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.scholarTranslation.update({
      where: { scholarId_locale: { scholarId, locale } },
      data: { ...fields },
    });
    return this.mapScholarTranslation(record);
  }

  async publishScholarTranslation(scholarId: string, locale: Locale): Promise<TranslationViewDto> {
    const record = await this.prisma.scholarTranslation.update({
      where: { scholarId_locale: { scholarId, locale } },
      data: { status: 'published' },
    });
    return this.mapScholarTranslation(record);
  }

  async unpublishScholarTranslation(
    scholarId: string,
    locale: Locale,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.scholarTranslation.update({
      where: { scholarId_locale: { scholarId, locale } },
      data: { status: 'draft' },
    });
    return this.mapScholarTranslation(record);
  }
}

function normalizeCountryCode(country: string | null | undefined): CountryCode | undefined {
  return country ? validateCountryCode(country) : undefined;
}
