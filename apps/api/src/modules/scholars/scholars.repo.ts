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
} from '@sd/core-contracts';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';
import type { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';
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
        lectureCount: r._count.listings,
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
      this.prisma.listing.aggregate({
        where: {
          scholarId: record.id,
          format: 'single',
          status: Status.published,
          deletedAt: null,
        },
        _count: { id: true },
        _sum: { durationSeconds: true },
      }),
      this.prisma.listing.count({
        where: {
          scholarId: record.id,
          format: 'series',
          parentId: null,
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

      const lectureCount = r.format === 'single' ? undefined : (r.publishedLectureCount ?? 0);

      const durationSeconds =
        r.format === 'single'
          ? (r.durationSeconds ?? undefined)
          : (r.publishedDurationSeconds ?? undefined);

      const recencyAt = (r.publishedAt ?? r.createdAt).toISOString();

      return {
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        type: r.format as 'collection' | 'series' | 'single',
        recencyAt,
        coverImageUrl: r.coverImageUrl ?? undefined,
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
      select: { id: true },
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
        topicId: true,
        topic: {
          select: {
            id: true,
            name: true,
            translations: {
              where: { locale: locale as DbLocale, status: 'published' },
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
              where: { locale: locale as DbLocale, status: 'published' },
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

      const lectureCount = r.format === 'single' ? undefined : (r.publishedLectureCount ?? 0);

      const durationSeconds =
        r.format === 'single'
          ? (r.durationSeconds ?? undefined)
          : (r.publishedDurationSeconds ?? undefined);

      const recencyAt = (r.publishedAt ?? r.createdAt).toISOString();

      const bucket = ensureTopic(row.topicId, topicName);
      bucket.items.push({
        id: r.id,
        slug: r.slug,
        title: resolved.fields.title,
        type: r.format as 'collection' | 'series' | 'single',
        recencyAt,
        coverImageUrl: r.coverImageUrl ?? undefined,
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
}
