import { PrismaService } from '../../shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import { Status } from '@sd/core-db';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarContentDto,
  CollectionSummaryDto,
  SeriesSummaryDto,
  LectureSummaryDto,
  TranslationViewDto,
} from '@sd/core-contracts';
import type { Locale } from '@sd/core-i18n';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';
import type { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';
import type { SaveSeriesTranslationDto } from './dto/save-series-translation.dto';
import type { SaveCollectionTranslationDto } from './dto/save-collection-translation.dto';

@Injectable()
export class ScholarsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<{ scholars: ScholarListItemDto[] }> {
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

    const scholars: ScholarListItemDto[] = records.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      imageUrl: r.imageUrl ?? undefined,
      mainLanguage: r.mainLanguage ?? undefined,
      isKibar: r.isKibar,
      lectureCount: r._count.lectures,
    }));

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
      },
    });

    if (!record) return null;

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
      name: record.name,
      bio: record.bio ?? undefined,
      country: record.country ?? undefined,
      mainLanguage: record.mainLanguage ?? undefined,
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

  async getContent(slug: string): Promise<ScholarContentDto | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    });

    if (!scholar) return null;

    const [collections, standaloneSeries, standaloneLectures] =
      await Promise.all([
        this.getCollections(scholar.id),
        this.getStandaloneSeries(scholar.id),
        this.getStandaloneLectures(scholar.id),
      ]);

    return { collections, standaloneSeries, standaloneLectures };
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

  async listScholarTranslations(
    scholarId: string,
  ): Promise<TranslationViewDto[]> {
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

  async publishScholarTranslation(
    scholarId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
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

  async listSeriesTranslations(
    seriesId: string,
  ): Promise<TranslationViewDto[]> {
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

  async publishSeriesTranslation(
    seriesId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    const record = await this.prisma.seriesTranslation.update({
      where: { seriesId_locale: { seriesId, locale: locale as Locale } },
      data: { status: 'published' },
    });
    return this.mapSeriesTranslation(record);
  }

  async unpublishSeriesTranslation(
    seriesId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
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

  async listCollectionTranslations(
    collectionId: string,
  ): Promise<TranslationViewDto[]> {
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

  private async getCollections(
    scholarId: string,
  ): Promise<CollectionSummaryDto[]> {
    const records = await this.prisma.collection.findMany({
      where: {
        scholarId,
        status: Status.published,
        deletedAt: null,
      },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        coverImageUrl: true,
        _count: {
          select: {
            series: {
              where: {
                status: Status.published,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return records.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      coverImageUrl: r.coverImageUrl ?? undefined,
      lectureCount: r._count.series,
    }));
  }

  private async getStandaloneSeries(
    scholarId: string,
  ): Promise<SeriesSummaryDto[]> {
    const records = await this.prisma.series.findMany({
      where: {
        scholarId,
        collectionId: null,
        status: Status.published,
        deletedAt: null,
      },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        coverImageUrl: true,
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

    return records.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      coverImageUrl: r.coverImageUrl ?? undefined,
      lectureCount: r._count.lectures,
    }));
  }

  private async getStandaloneLectures(
    scholarId: string,
  ): Promise<LectureSummaryDto[]> {
    const records = await this.prisma.lecture.findMany({
      where: {
        scholarId,
        seriesId: null,
        status: Status.published,
        deletedAt: null,
      },
      orderBy: [{ publishedAt: 'desc' }, { title: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        durationSeconds: true,
        publishedAt: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      durationSeconds: r.durationSeconds ?? undefined,
      publishedAt: r.publishedAt?.toISOString(),
    }));
  }
}
