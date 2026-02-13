import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { ConfigService } from '@/shared/config/config.service';
import { Prisma, Status } from '@sd/db/client';
import { UpsertLectureDto } from './dto/upsert-lecture.dto';
import { LectureViewDto } from './dto/lecture-view.dto';
import { AudioAssetViewDto } from '../audio-assets/dto/audio-asset-view.dto';

const lectureViewSelect = {
  id: true,
  scholarId: true,
  seriesId: true,
  slug: true,
  title: true,
  description: true,
  language: true,
  status: true,
  publishedAt: true,
  orderIndex: true,
  durationSeconds: true,
  deletedAt: true,
  deleteAfterAt: true,
  createdAt: true,
  updatedAt: true,
  audioAssets: {
    where: { isPrimary: true },
    orderBy: [{ createdAt: 'asc' }],
    take: 1,
    select: {
      id: true,
      lectureId: true,
      url: true,
      format: true,
      bitrateKbps: true,
      sizeBytes: true,
      durationSeconds: true,
      source: true,
      isPrimary: true,
      createdAt: true,
    },
  },
} satisfies Prisma.LectureSelect;

type LectureViewRecord = Prisma.LectureGetPayload<{
  select: typeof lectureViewSelect;
}>;

@Injectable()
export class LecturesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listPublishedByScholarSlug(
    scholarSlug: string,
  ): Promise<LectureViewDto[]> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });
    if (!scholar) return [];

    const records = await this.prisma.lecture.findMany({
      where: {
        scholarId: scholar.id,
        deletedAt: null,
        status: Status.published,
        OR: [
          { seriesId: null },
          {
            series: {
              is: {
                deletedAt: null,
                status: Status.published,
                OR: [
                  { collectionId: null },
                  {
                    collection: {
                      is: {
                        deletedAt: null,
                        status: Status.published,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      orderBy: [{ orderIndex: 'asc' }, { title: 'asc' }],
      select: lectureViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  async findPublishedByScholarSlugAndSlug(
    scholarSlug: string,
    slug: string,
  ): Promise<LectureViewDto | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });
    if (!scholar) return null;

    const record = await this.prisma.lecture.findFirst({
      where: {
        scholarId: scholar.id,
        slug,
        deletedAt: null,
        status: Status.published,
        OR: [
          { seriesId: null },
          {
            series: {
              is: {
                deletedAt: null,
                status: Status.published,
                OR: [
                  { collectionId: null },
                  {
                    collection: {
                      is: {
                        deletedAt: null,
                        status: Status.published,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      select: lectureViewSelect,
    });

    return record ? this.toViewDto(record) : null;
  }

  async findPublishedById(id: string): Promise<LectureViewDto | null> {
    const record = await this.prisma.lecture.findFirst({
      where: {
        id,
        deletedAt: null,
        status: Status.published,
        scholar: {
          isActive: true,
        },
        OR: [
          { seriesId: null },
          {
            series: {
              is: {
                deletedAt: null,
                status: Status.published,
                OR: [
                  { collectionId: null },
                  {
                    collection: {
                      is: {
                        deletedAt: null,
                        status: Status.published,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      select: lectureViewSelect,
    });

    return record ? this.toViewDto(record) : null;
  }

  async upsertByScholarSlug(
    scholarSlug: string,
    input: UpsertLectureDto,
  ): Promise<LectureViewDto | null> {
    const scholar = await this.prisma.scholar.findUnique({
      where: { slug: scholarSlug },
      select: { id: true },
    });
    if (!scholar) return null;

    const seriesId = await this.resolveOptionalSeriesId(
      scholar.id,
      input.seriesSlug,
    );
    if (input.seriesSlug && !seriesId) return null; // parent series not found

    const record = await this.prisma.lecture.upsert({
      where: { scholarId_slug: { scholarId: scholar.id, slug: input.slug } },
      select: lectureViewSelect,
      create: {
        scholarId: scholar.id,
        seriesId,
        slug: input.slug,
        title: input.title,
        description: input.description,
        language: input.language,
        status: input.status ?? Status.draft,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        orderIndex: input.orderIndex,
        durationSeconds: input.durationSeconds,
        deletedAt: input.deletedAt ? new Date(input.deletedAt) : null,
        deleteAfterAt: input.deleteAfterAt
          ? new Date(input.deleteAfterAt)
          : null,
      },
      update: {
        seriesId,
        title: input.title,
        description: input.description,
        language: input.language,
        status: input.status ?? Status.draft,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        orderIndex: input.orderIndex,
        durationSeconds: input.durationSeconds,
        deletedAt: input.deletedAt ? new Date(input.deletedAt) : null,
        deleteAfterAt: input.deleteAfterAt
          ? new Date(input.deleteAfterAt)
          : null,
      },
    });

    return this.toViewDto(record);
  }

  /**
   * List published lectures that belong to a given scholar + series.
   * Returns null if either the scholar or the series is not found.
   */
  async listPublishedByScholarAndSeriesSlug(
    scholarSlug: string,
    seriesSlug: string,
  ): Promise<LectureViewDto[] | null> {
    const scholar = await this.prisma.scholar.findFirst({
      where: { slug: scholarSlug, isActive: true },
      select: { id: true },
    });

    if (!scholar) {
      return null;
    }

    const series = await this.prisma.series.findFirst({
      where: {
        scholarId: scholar.id,
        slug: seriesSlug,
        deletedAt: null,
        status: Status.published,
        OR: [
          { collectionId: null },
          {
            collection: {
              is: {
                deletedAt: null,
                status: Status.published,
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (!series) {
      return null;
    }

    const records = await this.prisma.lecture.findMany({
      where: {
        scholarId: scholar.id,
        seriesId: series.id,
        deletedAt: null,
        status: Status.published,
      },
      orderBy: [
        { orderIndex: 'asc' },
        { publishedAt: 'desc' },
        { title: 'asc' },
      ],
      select: lectureViewSelect,
    });

    return records.map((r) => this.toViewDto(r));
  }

  // ----------------
  // Helpers
  // ----------------

  private async resolveOptionalSeriesId(
    scholarId: string,
    seriesSlug?: string,
  ): Promise<string | null> {
    if (!seriesSlug) return null;

    const series = await this.prisma.series.findUnique({
      where: { scholarId_slug: { scholarId, slug: seriesSlug } },
      select: { id: true },
    });

    return series?.id ?? null;
  }

  private toViewDto(record: LectureViewRecord): LectureViewDto {
    const primaryAudioAsset = record.audioAssets[0];

    return {
      id: record.id,
      scholarId: record.scholarId,
      seriesId: record.seriesId ?? undefined,
      slug: record.slug,
      title: record.title,
      description: record.description ?? undefined,
      language: record.language ?? undefined,
      status: record.status,
      publishedAt: record.publishedAt?.toISOString(),
      orderIndex: record.orderIndex ?? undefined,
      durationSeconds: record.durationSeconds ?? undefined,
      primaryAudioAsset: primaryAudioAsset
        ? this.toPrimaryAudioAssetDto(primaryAudioAsset)
        : undefined,
      deletedAt: record.deletedAt?.toISOString(),
      deleteAfterAt: record.deleteAfterAt?.toISOString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt?.toISOString(),
    };
  }

  private toPrimaryAudioAssetDto(
    asset: LectureViewRecord['audioAssets'][number],
  ): AudioAssetViewDto {
    return {
      id: asset.id,
      lectureId: asset.lectureId,
      url: this.toPublicUrl(asset.url),
      format: asset.format ?? undefined,
      bitrateKbps: asset.bitrateKbps ?? undefined,
      sizeBytes:
        asset.sizeBytes !== null ? asset.sizeBytes.toString() : undefined,
      durationSeconds: asset.durationSeconds ?? undefined,
      source: asset.source ?? undefined,
      isPrimary: asset.isPrimary,
      createdAt: asset.createdAt.toISOString(),
    };
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
}
