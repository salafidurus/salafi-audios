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
} from '@sd/core-contracts';

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
