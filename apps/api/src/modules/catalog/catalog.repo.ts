import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { ConfigService } from '@/shared/config/config.service';
import { Prisma, Status } from '@sd/db/client';
import { decodeCursor, encodeCursor } from './utils/catalog.cursor';
import { CatalogListQueryDto } from './dto/catalog-list.query.dto';
import { CatalogPageDto } from './dto/catalog-page.dto';
import { CollectionViewDto } from '../collections/dto/collection-view.dto';
import { SeriesViewDto } from '../series/dto/series-view.dto';
import { LectureViewDto } from '../lectures/dto/lecture-view.dto';

const DEFAULT_LIMIT = 20;

const collectionSelect = {
  id: true,
  scholarId: true,
  slug: true,
  title: true,
  description: true,
  coverImageUrl: true,
  language: true,
  status: true,
  orderIndex: true,
  deletedAt: true,
  deleteAfterAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CollectionSelect;

type CollectionRecord = Prisma.CollectionGetPayload<{
  select: typeof collectionSelect;
}>;

const seriesSelect = {
  id: true,
  scholarId: true,
  collectionId: true,
  slug: true,
  title: true,
  description: true,
  coverImageUrl: true,
  language: true,
  status: true,
  orderIndex: true,
  deletedAt: true,
  deleteAfterAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SeriesSelect;

type SeriesRecord = Prisma.SeriesGetPayload<{ select: typeof seriesSelect }>;

const lectureSelect = {
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

type LectureRecord = Prisma.LectureGetPayload<{ select: typeof lectureSelect }>;

@Injectable()
export class CatalogRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listCollections(
    query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<CollectionViewDto>> {
    const take = Math.min(query.limit ?? DEFAULT_LIMIT, 50);
    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const where: Prisma.CollectionWhereInput = {
      status: Status.published,
      deletedAt: null,
      ...(query.language ? { language: query.language } : {}),
      ...(query.scholarSlug
        ? { scholar: { isActive: true, slug: query.scholarSlug } }
        : { scholar: { isActive: true } }),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.topicSlug
        ? { topics: { some: { topic: { slug: query.topicSlug } } } }
        : {}),
    };

    const rows = await this.prisma.collection.findMany({
      where,
      select: collectionSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor.id },
          }
        : {}),
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const items = rows.slice(0, take).map((r) => this.toCollectionViewDto(r));

    const nextCursor = hasMore
      ? encodeCursor({
          createdAt: rows[take - 1]!.createdAt.toISOString(),
          id: rows[take - 1]!.id,
        })
      : undefined;

    return { items, nextCursor };
  }

  async listRootSeries(
    query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<SeriesViewDto>> {
    const take = Math.min(query.limit ?? DEFAULT_LIMIT, 50);
    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const where: Prisma.SeriesWhereInput = {
      status: Status.published,
      deletedAt: null,
      collectionId: null, // ✅ root only
      ...(query.language ? { language: query.language } : {}),
      ...(query.scholarSlug
        ? { scholar: { isActive: true, slug: query.scholarSlug } }
        : { scholar: { isActive: true } }),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.topicSlug
        ? { topics: { some: { topic: { slug: query.topicSlug } } } }
        : {}),
    };

    const rows = await this.prisma.series.findMany({
      where,
      select: seriesSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const items = rows.slice(0, take).map((r) => this.toSeriesViewDto(r));

    const nextCursor = hasMore
      ? encodeCursor({
          createdAt: rows[take - 1]!.createdAt.toISOString(),
          id: rows[take - 1]!.id,
        })
      : undefined;

    return { items, nextCursor };
  }

  async listRootLectures(
    query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<LectureViewDto>> {
    const take = Math.min(query.limit ?? DEFAULT_LIMIT, 50);
    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const where: Prisma.LectureWhereInput = {
      status: Status.published,
      deletedAt: null,
      seriesId: null, // ✅ root only
      ...(query.language ? { language: query.language } : {}),
      ...(query.scholarSlug
        ? { scholar: { isActive: true, slug: query.scholarSlug } }
        : { scholar: { isActive: true } }),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.topicSlug
        ? { topics: { some: { topic: { slug: query.topicSlug } } } }
        : {}),
    };

    const rows = await this.prisma.lecture.findMany({
      where,
      select: lectureSelect,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      ...(cursor ? { skip: 1, cursor: { id: cursor.id } } : {}),
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const items = rows.slice(0, take).map((r) => this.toLectureViewDto(r));

    const nextCursor = hasMore
      ? encodeCursor({
          createdAt: rows[take - 1]!.createdAt.toISOString(),
          id: rows[take - 1]!.id,
        })
      : undefined;

    return { items, nextCursor };
  }

  // ------------------------
  // Mapping (repo-owned)
  // ------------------------

  private toCollectionViewDto(r: CollectionRecord): CollectionViewDto {
    return {
      id: r.id,
      scholarId: r.scholarId,
      slug: r.slug,
      title: r.title,
      description: r.description ?? undefined,
      coverImageUrl: r.coverImageUrl ?? undefined,
      language: r.language ?? undefined,
      status: r.status,
      orderIndex: r.orderIndex ?? undefined,
      deletedAt: r.deletedAt ? r.deletedAt.toISOString() : undefined,
      deleteAfterAt: r.deleteAfterAt
        ? r.deleteAfterAt.toISOString()
        : undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
    };
  }

  private toSeriesViewDto(r: SeriesRecord): SeriesViewDto {
    return {
      id: r.id,
      scholarId: r.scholarId,
      collectionId: r.collectionId ?? undefined,
      slug: r.slug,
      title: r.title,
      description: r.description ?? undefined,
      coverImageUrl: r.coverImageUrl ?? undefined,
      language: r.language ?? undefined,
      status: r.status,
      orderIndex: r.orderIndex ?? undefined,
      deletedAt: r.deletedAt ? r.deletedAt.toISOString() : undefined,
      deleteAfterAt: r.deleteAfterAt
        ? r.deleteAfterAt.toISOString()
        : undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
    };
  }

  private toLectureViewDto(r: LectureRecord): LectureViewDto {
    const primaryAudioAsset = r.audioAssets[0];

    return {
      id: r.id,
      scholarId: r.scholarId,
      seriesId: r.seriesId ?? undefined,
      slug: r.slug,
      title: r.title,
      description: r.description ?? undefined,
      language: r.language ?? undefined,
      status: r.status,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : undefined,
      orderIndex: r.orderIndex ?? undefined,
      durationSeconds: r.durationSeconds ?? undefined,
      primaryAudioAsset: primaryAudioAsset
        ? {
            id: primaryAudioAsset.id,
            lectureId: primaryAudioAsset.lectureId,
            url: this.toPublicUrl(primaryAudioAsset.url),
            format: primaryAudioAsset.format ?? undefined,
            bitrateKbps: primaryAudioAsset.bitrateKbps ?? undefined,
            sizeBytes:
              primaryAudioAsset.sizeBytes !== null
                ? primaryAudioAsset.sizeBytes.toString()
                : undefined,
            durationSeconds: primaryAudioAsset.durationSeconds ?? undefined,
            source: primaryAudioAsset.source ?? undefined,
            isPrimary: primaryAudioAsset.isPrimary,
            createdAt: primaryAudioAsset.createdAt.toISOString(),
          }
        : undefined,
      deletedAt: r.deletedAt ? r.deletedAt.toISOString() : undefined,
      deleteAfterAt: r.deleteAfterAt
        ? r.deleteAfterAt.toISOString()
        : undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
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
