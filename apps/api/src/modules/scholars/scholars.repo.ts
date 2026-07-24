import { PrismaService } from '../../core/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Status, Locale as DbLocale, Prisma } from '@sd/core-db';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
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
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { decodeCursor, buildPaginatedResult } from '../../shared/utils/pagination';

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
      ...(decodedCursor ? { cursor: { id: decodedCursor }, skip: 1 } : {}),
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
      country: (record.country ?? undefined) as ScholarDetailDto['country'],
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
              where: { locale: locale as DbLocale },
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
        country: (scholar.country ?? undefined) as any,
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
  ): Promise<{ items: AdminScholarListItemDto[]; nextCursor?: string; hasMore: boolean }> {
    const pageSize = 50;
    const take = pageSize + 1;

    const where: Prisma.ScholarWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const records = await this.prisma.scholar.findMany({
      where,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
          select: { locale: true, name: true, status: true },
          orderBy: { locale: 'asc' },
        },
      },
    });

    const hasMore = records.length > pageSize;
    const items: AdminScholarListItemDto[] = (hasMore ? records.slice(0, pageSize) : records).map(
      (r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        bio: r.bio ?? undefined,
        country: (r.country ?? undefined) as AdminScholarListItemDto['country'],
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
      }),
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

      // Create translations if provided
      if (dto.translations) {
        await Promise.all(
          Object.entries(dto.translations).map(([locale, fields]) =>
            tx.scholarTranslation.create({
              data: {
                scholarId: scholar.id,
                locale: locale as Locale,
                name: fields.name,
                bio: fields.bio ?? null,
                status: 'draft',
              },
            }),
          ),
        );
      }

      return scholar;
    });
  }

  async update(id: string, dto: UpdateScholarDto) {
    return this.prisma.$transaction(async (tx) => {
      // Update scholar fields if provided
      const updateData: Record<string, any> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.slug !== undefined) updateData.slug = dto.slug;
      if (dto.bio !== undefined) updateData.bio = dto.bio;
      if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
      if (dto.country !== undefined) updateData.country = dto.country;
      if (dto.mainLanguage !== undefined) updateData.mainLanguage = dto.mainLanguage;
      if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
      if (dto.socialTwitter !== undefined) updateData.socialTwitter = dto.socialTwitter;
      if (dto.socialTelegram !== undefined) updateData.socialTelegram = dto.socialTelegram;
      if (dto.socialYoutube !== undefined) updateData.socialYoutube = dto.socialYoutube;
      if (dto.socialWebsite !== undefined) updateData.socialWebsite = dto.socialWebsite;
      updateData.updatedAt = new Date();

      const scholar = await tx.scholar.update({
        where: { id },
        data: updateData,
      });

      // Upsert translations if provided
      if (dto.translations) {
        await Promise.all(
          Object.entries(dto.translations).map(([locale, fields]) =>
            tx.scholarTranslation.upsert({
              where: { scholarId_locale: { scholarId: id, locale: locale as Locale } },
              create: {
                scholarId: id,
                locale: locale as Locale,
                name: fields.name,
                bio: fields.bio ?? null,
                status: 'draft',
              },
              update: {
                name: fields.name,
                bio: fields.bio ?? null,
              },
            }),
          ),
        );
      }

      return scholar;
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
