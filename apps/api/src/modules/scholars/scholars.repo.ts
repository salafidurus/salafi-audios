import { PrismaService } from '../../core/db/prisma.service';
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
} from '@sd/core-contracts';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';
import type { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { syncMainLanguageTranslation } from '../../shared/i18n/sync-main-language-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { decodeCursor, buildPaginatedResult } from '../../shared/utils/pagination';

function toOptional<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

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

@Injectable()
export class ScholarsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
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
      },
    });
    if (decodedCursor) {
      records.splice(0, 0);
    }

    const scholars: ScholarListItemDto[] = records.map((r) => {
      const resolved = resolveContentTranslation({
        base: { name: r.name },
        originalLanguage: r.mainLanguage,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      return {
        id: r.id,
        slug: r.slug,
        name: resolved.fields.name,
        imageUrl: r.imageUrl ?? undefined,
        mainLanguage: r.mainLanguage ?? undefined,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { name: resolved.original.name } : undefined,
        title: r.title ?? undefined,
        lectureCount: r._count.listings,
      };
    });

    const result = buildPaginatedResult(scholars, pageSize);
    return { scholars: result.items, nextCursor: result.nextCursor, hasMore: result.hasMore };
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

    return {
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
    };
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

      const lectureCount = r.format === 'single' ? 1 : (r.publishedLectureCount ?? 0);

      const durationSeconds =
        r.format === 'single'
          ? (r.durationSeconds ?? undefined)
          : (r.publishedDurationSeconds ?? undefined);

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

    for (const row of listingTopics) {
      const r = row.listing;
      const topicName = row.topic.translations[0]?.name ?? row.topic.name;
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });

      const lectureCount = r.format === 'single' ? 1 : (r.publishedLectureCount ?? 0);

      const durationSeconds =
        r.format === 'single'
          ? (r.durationSeconds ?? undefined)
          : (r.publishedDurationSeconds ?? undefined);

      const recencyAt = (r.publishedAt ?? r.createdAt).toISOString();

      const bucket = ensureTopic(row.topic.id, topicName);
      bucket.items.push({
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
      });
    }

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

    return {
      scholar: {
        id: scholar.id,
        name: scholar.name,
        slug: scholar.slug,
        bio: scholar.bio ?? undefined,
        imageUrl: scholar.imageUrl ?? undefined,
        country: scholar.country ?? undefined,
        mainLanguage: scholar.mainLanguage ?? undefined,
        isActive: scholar.isActive,
        title: scholar.title ?? undefined,
        orderIndex: scholar.orderIndex,
        socialTwitter: scholar.socialTwitter ?? undefined,
        socialTelegram: scholar.socialTelegram ?? undefined,
        socialYoutube: scholar.socialYoutube ?? undefined,
        socialWebsite: scholar.socialWebsite ?? undefined,
        createdAt: scholar.createdAt.toISOString(),
        updatedAt: scholar.updatedAt?.toISOString(),
      },
      translations: scholar.translations.map((t) => ({
        locale: t.locale,
        status: t.status,
        fields: {
          name: t.name,
          bio: t.bio ?? null,
        },
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
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
          base: { name: r.name, bio: r.bio ?? undefined },
          originalLanguage: r.mainLanguage,
          targetLocale: locale,
          publishedTranslation: published
            ? { name: published.name, bio: published.bio ?? undefined }
            : null,
        }).fields;

        return {
          id: r.id,
          slug: r.slug,
          name: resolved.name,
          bio: resolved.bio,
          country: normalizeCountryCode(r.country),
          mainLanguage: r.mainLanguage ?? undefined,
          imageUrl: r.imageUrl ?? undefined,
          isActive: r.isActive,
          title: r.title ?? undefined,
          orderIndex: r.orderIndex,
          socialTwitter: r.socialTwitter ?? undefined,
          socialTelegram: r.socialTelegram ?? undefined,
          socialYoutube: r.socialYoutube ?? undefined,
          socialWebsite: r.socialWebsite ?? undefined,
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
      const hasTranslatableChange =
        dto.name !== undefined || dto.bio !== undefined || dto.mainLanguage !== undefined;
      const original = hasTranslatableChange
        ? await tx.scholar.findUnique({
            where: { id },
            select: { mainLanguage: true, name: true, bio: true },
          })
        : null;

      // Update scholar fields if provided
      const updateData = buildScholarUpdateData(dto);

      const scholar = await tx.scholar.update({
        where: { id },
        data: updateData,
      });

      if (hasTranslatableChange && original) {
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

      return scholar;
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
    status: string;
    name: string;
    bio: string | null;
    createdAt: Date;
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
