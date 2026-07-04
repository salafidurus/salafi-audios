import { PrismaService } from '../../shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Status, Locale as DbLocale } from '@sd/core-db';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarContentUnifiedDto,
  ScholarContentItemDto,
  ScholarTopicsDto,
  TranslationViewDto,
  Locale,
  AdminSeriesListItemDto,
  AdminSeriesDetailDto,
  AdminCollectionListItemDto,
  AdminCollectionDetailDto,
  BulkActionResultDto,
  StatusValue,
} from '@sd/core-contracts';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';
import type { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';
import type { SaveSeriesTranslationDto } from './dto/save-series-translation.dto';
import type { SaveCollectionTranslationDto } from './dto/save-collection-translation.dto';
import type { CreateSeriesDto } from './dto/create-series.dto';
import type { UpdateSeriesDto } from './dto/update-series.dto';
import type { CreateCollectionDto } from './dto/create-collection.dto';
import type { UpdateCollectionDto } from './dto/update-collection.dto';
import { resolveContentTranslation } from '../../shared/utils/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

@Injectable()
export class ScholarsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<{ scholars: ScholarListItemDto[] }> {
    const locale = getRequestLocale();
    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        imageUrl: true,
        mainLanguage: true,
        isKibar: true,
        translations: {
          where: { locale, status: 'published' },
          select: { name: true },
          take: 1,
        },
        _count: {
          select: {
            lectures: {
              where: {
                status: Status.published,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

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
        isKibar: r.isKibar,
        lectureCount: r._count.lectures,
      };
    });

    return { scholars };
  }

  async findBySlug(slug: string): Promise<
    | (ScholarDetailDto & {
        lectureCount: number;
        seriesCount: number;
        totalDurationSeconds: number;
      })
    | null
  > {
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
        imageUrl: true,
        isActive: true,
        isKibar: true,
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

    const [lectureStats, seriesCount] = await Promise.all([
      this.prisma.lecture.aggregate({
        where: {
          scholarId: record.id,
          status: Status.published,
          deletedAt: null,
        },
        _count: { id: true },
        _sum: { durationSeconds: true },
      }),
      this.prisma.series.count({
        where: {
          scholarId: record.id,
          status: Status.published,
          deletedAt: null,
        },
      }),
    ]);

    return {
      id: record.id,
      slug: record.slug,
      name: resolved.fields.name,
      bio: resolved.fields.bio ?? undefined,
      country: record.country ?? undefined,
      mainLanguage: record.mainLanguage ?? undefined,
      originalLanguage: resolved.originalLanguage,
      original: resolved.original
        ? {
            name: resolved.original.name,
            bio: resolved.original.bio ?? undefined,
          }
        : undefined,
      imageUrl: record.imageUrl ?? undefined,
      isActive: record.isActive,
      isKibar: record.isKibar,
      socialTwitter: record.socialTwitter ?? undefined,
      socialTelegram: record.socialTelegram ?? undefined,
      socialYoutube: record.socialYoutube ?? undefined,
      socialWebsite: record.socialWebsite ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt?.toISOString(),
      lectureCount: lectureStats._count.id,
      seriesCount,
      totalDurationSeconds: lectureStats._sum.durationSeconds ?? 0,
    };
  }

  async getContent(slug: string): Promise<ScholarContentUnifiedDto | null> {
    const locale = getRequestLocale();
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!scholar) return null;

    const [collectionRecords, seriesRecords, lectureRecords] = await Promise.all([
      this.prisma.collection.findMany({
        where: { scholarId: scholar.id, status: Status.published, deletedAt: null },
        select: {
          id: true,
          slug: true,
          title: true,
          language: true,
          coverImageUrl: true,
          createdAt: true,
          translations: {
            where: { locale, status: 'published' },
            select: { title: true },
            take: 1,
          },
          _count: { select: { series: { where: { status: Status.published, deletedAt: null } } } },
        },
      }),
      this.prisma.series.findMany({
        where: {
          scholarId: scholar.id,
          collectionId: null,
          status: Status.published,
          deletedAt: null,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          language: true,
          coverImageUrl: true,
          createdAt: true,
          translations: {
            where: { locale, status: 'published' },
            select: { title: true },
            take: 1,
          },
          _count: {
            select: { lectures: { where: { status: Status.published, deletedAt: null } } },
          },
        },
      }),
      this.prisma.lecture.findMany({
        where: { scholarId: scholar.id, seriesId: null, status: Status.published, deletedAt: null },
        select: {
          id: true,
          slug: true,
          title: true,
          language: true,
          durationSeconds: true,
          publishedAt: true,
          createdAt: true,
          translations: {
            where: { locale, status: 'published' },
            select: { title: true },
            take: 1,
          },
        },
      }),
    ]);

    const items: ScholarContentItemDto[] = [
      ...collectionRecords.map((r) => {
        const resolved = resolveContentTranslation({
          base: { title: r.title },
          originalLanguage: r.language,
          targetLocale: locale,
          publishedTranslation: r.translations[0] ?? null,
        });
        return {
          id: r.id,
          slug: r.slug,
          title: resolved.fields.title,
          type: 'collection' as const,
          recencyAt: r.createdAt.toISOString(),
          coverImageUrl: r.coverImageUrl ?? undefined,
          lectureCount: r._count.series,
          originalLanguage: resolved.originalLanguage,
          original: resolved.original ? { title: resolved.original.title } : undefined,
        };
      }),
      ...seriesRecords.map((r) => {
        const resolved = resolveContentTranslation({
          base: { title: r.title },
          originalLanguage: r.language,
          targetLocale: locale,
          publishedTranslation: r.translations[0] ?? null,
        });
        return {
          id: r.id,
          slug: r.slug,
          title: resolved.fields.title,
          type: 'series' as const,
          recencyAt: r.createdAt.toISOString(),
          coverImageUrl: r.coverImageUrl ?? undefined,
          lectureCount: r._count.lectures,
          originalLanguage: resolved.originalLanguage,
          original: resolved.original ? { title: resolved.original.title } : undefined,
        };
      }),
      ...lectureRecords.map((r) => {
        const resolved = resolveContentTranslation({
          base: { title: r.title },
          originalLanguage: r.language,
          targetLocale: locale,
          publishedTranslation: r.translations[0] ?? null,
        });
        return {
          id: r.id,
          slug: r.slug,
          title: resolved.fields.title,
          type: 'single' as const,
          recencyAt: (r.publishedAt ?? r.createdAt).toISOString(),
          durationSeconds: r.durationSeconds ?? undefined,
          originalLanguage: resolved.originalLanguage,
          original: resolved.original ? { title: resolved.original.title } : undefined,
        };
      }),
    ];

    items.sort((a, b) => b.recencyAt.localeCompare(a.recencyAt));

    return { items };
  }

  async getTopics(slug: string): Promise<ScholarTopicsDto | null> {
    const locale = getRequestLocale();
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!scholar) return null;

    // Collect all topics + their content items for this scholar.
    // We fan-out across lectureTopics, seriesTopics, and collectionTopics.
    const [lectureTopicRows, seriesTopicRows, collectionTopicRows] = await Promise.all([
      this.prisma.lectureTopic.findMany({
        where: {
          lecture: { scholarId: scholar.id, status: Status.published, deletedAt: null, seriesId: null },
        },
        select: {
          topicId: true,
          topic: {
            select: {
              name: true,
              translations: {
                where: { locale: locale as DbLocale, status: 'published' },
                select: { name: true },
                take: 1,
              },
            },
          },
          lecture: {
            select: {
              id: true,
              slug: true,
              title: true,
              language: true,
              durationSeconds: true,
              publishedAt: true,
              createdAt: true,
              translations: {
                where: { locale: locale as DbLocale, status: 'published' },
                select: { title: true },
                take: 1,
              },
            },
          },
        },
      }),
      this.prisma.seriesTopic.findMany({
        where: {
          series: { scholarId: scholar.id, status: Status.published, deletedAt: null, collectionId: null },
        },
        select: {
          topicId: true,
          topic: {
            select: {
              name: true,
              translations: {
                where: { locale: locale as DbLocale, status: 'published' },
                select: { name: true },
                take: 1,
              },
            },
          },
          series: {
            select: {
              id: true,
              slug: true,
              title: true,
              language: true,
              coverImageUrl: true,
              createdAt: true,
              translations: {
                where: { locale: locale as DbLocale, status: 'published' },
                select: { title: true },
                take: 1,
              },
              _count: { select: { lectures: { where: { status: Status.published, deletedAt: null } } } },
            },
          },
        },
      }),
      this.prisma.collectionTopic.findMany({
        where: {
          collection: { scholarId: scholar.id, status: Status.published, deletedAt: null },
        },
        select: {
          topicId: true,
          topic: {
            select: {
              name: true,
              translations: {
                where: { locale: locale as DbLocale, status: 'published' },
                select: { name: true },
                take: 1,
              },
            },
          },
          collection: {
            select: {
              id: true,
              slug: true,
              title: true,
              language: true,
              coverImageUrl: true,
              createdAt: true,
              translations: {
                where: { locale: locale as DbLocale, status: 'published' },
                select: { title: true },
                take: 1,
              },
              _count: { select: { series: { where: { status: Status.published, deletedAt: null } } } },
            },
          },
        },
      }),
    ]);

    // Build a map: topicId -> { topicName, items[] }
    const topicMap = new Map<string, { topicName: string; items: ScholarContentItemDto[] }>();

    const ensureTopic = (topicId: string, topicName: string) => {
      if (!topicMap.has(topicId)) topicMap.set(topicId, { topicName, items: [] });
      return topicMap.get(topicId)!;
    };

    for (const row of lectureTopicRows) {
      const r = row.lecture;
      const topicName = row.topic.translations[0]?.name ?? row.topic.name;
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      const bucket = ensureTopic(row.topicId, topicName);
      bucket.items.push({
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        type: 'single' as const,
        recencyAt: (r.publishedAt ?? r.createdAt).toISOString(),
        durationSeconds: r.durationSeconds ?? undefined,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      });
    }

    for (const row of seriesTopicRows) {
      const r = row.series;
      const topicName = row.topic.translations[0]?.name ?? row.topic.name;
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      const bucket = ensureTopic(row.topicId, topicName);
      bucket.items.push({
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        type: 'series' as const,
        recencyAt: r.createdAt.toISOString(),
        coverImageUrl: r.coverImageUrl ?? undefined,
        lectureCount: r._count.lectures,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      });
    }

    for (const row of collectionTopicRows) {
      const r = row.collection;
      const topicName = row.topic.translations[0]?.name ?? row.topic.name;
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      const bucket = ensureTopic(row.topicId, topicName);
      bucket.items.push({
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        type: 'collection' as const,
        recencyAt: r.createdAt.toISOString(),
        coverImageUrl: r.coverImageUrl ?? undefined,
        lectureCount: r._count.series,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      });
    }

    // Sort items within each topic by recency, then return sorted topics
    const topics = Array.from(topicMap.entries()).map(([topicId, { topicName, items }]) => {
      items.sort((a, b) => b.recencyAt.localeCompare(a.recencyAt));
      return { topicId, topicName, items };
    });

    // Sort topics alphabetically by name (consistent with topics.repo.ts convention)
    topics.sort((a, b) => a.topicName.localeCompare(b.topicName));

    return { topics };
  }

  async findById(id: string) {
    return this.prisma.scholar.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateScholarDto) {
    return this.prisma.scholar.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        bio: dto.bio,
        imageUrl: dto.imageUrl,
        isKibar: dto.isKibar ?? false,
        isFeatured: dto.isFeatured ?? false,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateScholarDto) {
    return this.prisma.scholar.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.isKibar !== undefined && { isKibar: dto.isKibar }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedAt: new Date(),
      },
    });
  }

  // ─── Scholar translations ─────────────────────────────────────────────────

  private mapScholarTranslation(t: {
    locale: string;
    status: string;
    name: string;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale as Locale,
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
    locale: string,
    fields: Partial<{ name: string; bio: string | null }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.scholarTranslation.update({
      where: { scholarId_locale: { scholarId, locale: locale as Locale } },
      data: { ...fields },
    });
    return this.mapScholarTranslation(record);
  }

  async publishScholarTranslation(scholarId: string, locale: string): Promise<TranslationViewDto> {
    const record = await this.prisma.scholarTranslation.update({
      where: { scholarId_locale: { scholarId, locale: locale as Locale } },
      data: { status: 'published' },
    });
    return this.mapScholarTranslation(record);
  }

  async unpublishScholarTranslation(
    scholarId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.scholarTranslation.update({
      where: { scholarId_locale: { scholarId, locale: locale as Locale } },
      data: { status: 'draft' },
    });
    return this.mapScholarTranslation(record);
  }

  // ─── Series translations ──────────────────────────────────────────────────

  private mapSeriesTranslation(t: {
    locale: string;
    status: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale as Locale,
      status: t.status === 'published' ? 'published' : 'draft',
      fields: { title: t.title, description: t.description },
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  async listSeriesTranslations(seriesId: string): Promise<TranslationViewDto[]> {
    const records = await this.prisma.seriesTranslation.findMany({
      where: { seriesId },
      orderBy: { locale: 'asc' },
    });
    return records.map((r) => this.mapSeriesTranslation(r));
  }

  async upsertSeriesTranslation(
    seriesId: string,
    dto: SaveSeriesTranslationDto,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.seriesTranslation.upsert({
      where: { seriesId_locale: { seriesId, locale: dto.locale } },
      create: {
        seriesId,
        locale: dto.locale,
        title: dto.title,
        description: dto.description ?? null,
        status: 'draft',
      },
      update: { title: dto.title, description: dto.description ?? null },
    });
    return this.mapSeriesTranslation(record);
  }

  async updateSeriesTranslation(
    seriesId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.seriesTranslation.update({
      where: { seriesId_locale: { seriesId, locale: locale as Locale } },
      data: { ...fields },
    });
    return this.mapSeriesTranslation(record);
  }

  async publishSeriesTranslation(seriesId: string, locale: string): Promise<TranslationViewDto> {
    const record = await this.prisma.seriesTranslation.update({
      where: { seriesId_locale: { seriesId, locale: locale as Locale } },
      data: { status: 'published' },
    });
    return this.mapSeriesTranslation(record);
  }

  async unpublishSeriesTranslation(seriesId: string, locale: string): Promise<TranslationViewDto> {
    const record = await this.prisma.seriesTranslation.update({
      where: { seriesId_locale: { seriesId, locale: locale as Locale } },
      data: { status: 'draft' },
    });
    return this.mapSeriesTranslation(record);
  }

  // ─── Collection translations ──────────────────────────────────────────────

  private mapCollectionTranslation(t: {
    locale: string;
    status: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TranslationViewDto {
    return {
      locale: t.locale as Locale,
      status: t.status === 'published' ? 'published' : 'draft',
      fields: { title: t.title, description: t.description },
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  async listCollectionTranslations(collectionId: string): Promise<TranslationViewDto[]> {
    const records = await this.prisma.collectionTranslation.findMany({
      where: { collectionId },
      orderBy: { locale: 'asc' },
    });
    return records.map((r) => this.mapCollectionTranslation(r));
  }

  async upsertCollectionTranslation(
    collectionId: string,
    dto: SaveCollectionTranslationDto,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.collectionTranslation.upsert({
      where: { collectionId_locale: { collectionId, locale: dto.locale } },
      create: {
        collectionId,
        locale: dto.locale,
        title: dto.title,
        description: dto.description ?? null,
        status: 'draft',
      },
      update: { title: dto.title, description: dto.description ?? null },
    });
    return this.mapCollectionTranslation(record);
  }

  async updateCollectionTranslation(
    collectionId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.collectionTranslation.update({
      where: {
        collectionId_locale: { collectionId, locale: locale as Locale },
      },
      data: { ...fields },
    });
    return this.mapCollectionTranslation(record);
  }

  async publishCollectionTranslation(
    collectionId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.collectionTranslation.update({
      where: {
        collectionId_locale: { collectionId, locale: locale as Locale },
      },
      data: { status: 'published' },
    });
    return this.mapCollectionTranslation(record);
  }

  async unpublishCollectionTranslation(
    collectionId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.collectionTranslation.update({
      where: {
        collectionId_locale: { collectionId, locale: locale as Locale },
      },
      data: { status: 'draft' },
    });
    return this.mapCollectionTranslation(record);
  }

  // ─── Admin Series Methods ──────────────────────────────────────────────────

  async listAdminSeries(scholarId: string): Promise<AdminSeriesListItemDto[]> {
    const records = await this.prisma.series.findMany({
      where: { scholarId, deletedAt: null },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        status: true,
        orderIndex: true,
        _count: {
          select: {
            lectures: { where: { status: Status.published, deletedAt: null } },
          },
        },
      },
    });
    return records.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status as StatusValue,
      publishedLectureCount: r._count.lectures,
      orderIndex: r.orderIndex ?? undefined,
    }));
  }

  async findAdminSeriesDetail(id: string): Promise<AdminSeriesDetailDto | null> {
    const record = await this.prisma.series.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        scholarId: true,
        title: true,
        description: true,
        coverImageUrl: true,
        language: true,
        status: true,
        orderIndex: true,
      },
    });
    if (!record) return null;
    return {
      ...record,
      status: record.status as StatusValue,
      description: record.description ?? undefined,
      coverImageUrl: record.coverImageUrl ?? undefined,
      language: record.language ?? undefined,
      orderIndex: record.orderIndex ?? undefined,
    };
  }

  async createSeries(dto: CreateSeriesDto): Promise<{ id: string }> {
    return this.prisma.series.create({
      data: {
        scholarId: dto.scholarId,
        title: dto.title,
        slug: dto.title.toLowerCase().replace(/\s+/g, '-'),
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        language: dto.language as DbLocale | undefined,
        orderIndex: dto.orderIndex,
        status: Status.draft,
      },
      select: { id: true },
    });
  }

  async updateSeries(id: string, dto: UpdateSeriesDto): Promise<{ id: string } | null> {
    try {
      return await this.prisma.series.update({
        where: { id, deletedAt: null },
        data: {
          ...dto,
          language: dto.language as DbLocale | undefined,
        },
        select: { id: true },
      });
    } catch {
      return null;
    }
  }

  async updateSeriesStatus(id: string, status: Status): Promise<boolean> {
    const result = await this.prisma.series.updateMany({
      where: { id, deletedAt: null },
      data: { status },
    });
    return result.count > 0;
  }

  async bulkUpdateSeriesStatus(ids: string[], status: Status): Promise<BulkActionResultDto> {
    const succeeded: string[] = [];
    const failed: string[] = [];
    await Promise.all(
      ids.map(async (id) => {
        const ok = await this.updateSeriesStatus(id, status);
        (ok ? succeeded : failed).push(id);
      }),
    );
    return { succeeded, failed };
  }

  // ─── Admin Collection Methods ──────────────────────────────────────────────

  async listAdminCollections(scholarId: string): Promise<AdminCollectionListItemDto[]> {
    const records = await this.prisma.collection.findMany({
      where: { scholarId, deletedAt: null },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        status: true,
        orderIndex: true,
        publishedLectureCount: true,
      },
    });
    return records.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status as StatusValue,
      publishedLectureCount: r.publishedLectureCount ?? 0,
      orderIndex: r.orderIndex ?? undefined,
    }));
  }

  async findAdminCollectionDetail(id: string): Promise<AdminCollectionDetailDto | null> {
    const record = await this.prisma.collection.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        scholarId: true,
        title: true,
        description: true,
        coverImageUrl: true,
        language: true,
        status: true,
        orderIndex: true,
      },
    });
    if (!record) return null;
    return {
      ...record,
      status: record.status as StatusValue,
      description: record.description ?? undefined,
      coverImageUrl: record.coverImageUrl ?? undefined,
      language: record.language ?? undefined,
      orderIndex: record.orderIndex ?? undefined,
    };
  }

  async createCollection(dto: CreateCollectionDto): Promise<{ id: string }> {
    return this.prisma.collection.create({
      data: {
        scholarId: dto.scholarId,
        title: dto.title,
        slug: dto.title.toLowerCase().replace(/\s+/g, '-'),
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        language: dto.language as DbLocale | undefined,
        orderIndex: dto.orderIndex,
        status: Status.draft,
      },
      select: { id: true },
    });
  }

  async updateCollection(id: string, dto: UpdateCollectionDto): Promise<{ id: string } | null> {
    try {
      return await this.prisma.collection.update({
        where: { id, deletedAt: null },
        data: {
          ...dto,
          language: dto.language as DbLocale | undefined,
        },
        select: { id: true },
      });
    } catch {
      return null;
    }
  }

  async updateCollectionStatus(id: string, status: Status): Promise<boolean> {
    const result = await this.prisma.collection.updateMany({
      where: { id, deletedAt: null },
      data: { status },
    });
    return result.count > 0;
  }

  async bulkUpdateCollectionStatus(ids: string[], status: Status): Promise<BulkActionResultDto> {
    const succeeded: string[] = [];
    const failed: string[] = [];
    await Promise.all(
      ids.map(async (id) => {
        const ok = await this.updateCollectionStatus(id, status);
        (ok ? succeeded : failed).push(id);
      }),
    );
    return { succeeded, failed };
  }
}
