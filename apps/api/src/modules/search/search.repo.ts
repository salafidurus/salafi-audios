import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/db';
import type {
  CollectionViewDto,
  LectureViewDto,
  SeriesViewDto,
} from '@sd/contracts';
import { ConfigService } from '@/shared/config/config.service';
import { PrismaService } from '@/shared/db/prisma.service';
import type { SearchQueryDto } from './dto/search-query.dto';

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
export class SearchRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listCollections(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<CollectionViewDto[]> {
    const rows = await this.prisma.collection.findMany({
      where: this.collectionWhere(query, includeRelated),
      select: collectionSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    return rows.map((row) => this.toCollectionViewDto(row));
  }

  async listRootSeries(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SeriesViewDto[]> {
    const rows = await this.prisma.series.findMany({
      where: this.seriesWhere(query, includeRelated),
      select: seriesSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    return rows.map((row) => this.toSeriesViewDto(row));
  }

  async listRootLectures(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<LectureViewDto[]> {
    const rows = await this.prisma.lecture.findMany({
      where: this.lectureWhere(query, includeRelated),
      select: lectureSelect,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    return rows.map((row) => this.toLectureViewDto(row));
  }

  private collectionWhere(
    query: SearchQueryDto,
    includeRelated: boolean,
  ): Prisma.CollectionWhereInput {
    const topicFilter = this.collectionTopicFilter(query);

    return {
      status: Status.published,
      deletedAt: null,
      ...(query.language ? { language: query.language } : {}),
      ...(query.scholarSlug
        ? { scholar: { isActive: true, slug: query.scholarSlug } }
        : { scholar: { isActive: true } }),
      ...(query.q
        ? { OR: this.buildCollectionSearchOr(query.q, includeRelated) }
        : {}),
      ...(topicFilter ?? {}),
    };
  }

  private seriesWhere(
    query: SearchQueryDto,
    includeRelated: boolean,
  ): Prisma.SeriesWhereInput {
    const topicFilter = this.seriesTopicFilter(query);

    return {
      status: Status.published,
      deletedAt: null,
      collectionId: null,
      ...(query.language ? { language: query.language } : {}),
      ...(query.scholarSlug
        ? { scholar: { isActive: true, slug: query.scholarSlug } }
        : { scholar: { isActive: true } }),
      ...(query.q
        ? { OR: this.buildSeriesSearchOr(query.q, includeRelated) }
        : {}),
      ...(topicFilter ?? {}),
    };
  }

  private lectureWhere(
    query: SearchQueryDto,
    includeRelated: boolean,
  ): Prisma.LectureWhereInput {
    const topicFilter = this.lectureTopicFilter(query);

    return {
      status: Status.published,
      deletedAt: null,
      seriesId: null,
      ...(query.language ? { language: query.language } : {}),
      ...(query.scholarSlug
        ? { scholar: { isActive: true, slug: query.scholarSlug } }
        : { scholar: { isActive: true } }),
      ...(query.q
        ? { OR: this.buildLectureSearchOr(query.q, includeRelated) }
        : {}),
      ...(topicFilter ?? {}),
    };
  }

  private collectionTopicFilter(
    query: SearchQueryDto,
  ): Prisma.CollectionWhereInput | undefined {
    const topicSlugs = this.resolveTopicSlugs(query);

    if (!topicSlugs.length) return undefined;

    return { topics: { some: { topic: { slug: { in: topicSlugs } } } } };
  }

  private seriesTopicFilter(
    query: SearchQueryDto,
  ): Prisma.SeriesWhereInput | undefined {
    const topicSlugs = this.resolveTopicSlugs(query);

    if (!topicSlugs.length) return undefined;

    return { topics: { some: { topic: { slug: { in: topicSlugs } } } } };
  }

  private lectureTopicFilter(
    query: SearchQueryDto,
  ): Prisma.LectureWhereInput | undefined {
    const topicSlugs = this.resolveTopicSlugs(query);

    if (!topicSlugs.length) return undefined;

    return { topics: { some: { topic: { slug: { in: topicSlugs } } } } };
  }

  private resolveTopicSlugs(query: SearchQueryDto): string[] {
    if (query.topicSlugs && query.topicSlugs.length) {
      return query.topicSlugs;
    }

    if (query.topicSlug) {
      return [query.topicSlug];
    }

    return [];
  }

  private buildCollectionSearchOr(
    query: string,
    includeRelated: boolean,
  ): Prisma.CollectionWhereInput[] {
    const clauses: Prisma.CollectionWhereInput[] = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];

    if (includeRelated) {
      clauses.push(
        { scholar: { name: { contains: query, mode: 'insensitive' } } },
        {
          topics: {
            some: { topic: { name: { contains: query, mode: 'insensitive' } } },
          },
        },
        {
          topics: {
            some: { topic: { slug: { contains: query, mode: 'insensitive' } } },
          },
        },
      );
    }

    return clauses;
  }

  private buildSeriesSearchOr(
    query: string,
    includeRelated: boolean,
  ): Prisma.SeriesWhereInput[] {
    const clauses: Prisma.SeriesWhereInput[] = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];

    if (includeRelated) {
      clauses.push(
        { scholar: { name: { contains: query, mode: 'insensitive' } } },
        {
          topics: {
            some: { topic: { name: { contains: query, mode: 'insensitive' } } },
          },
        },
        {
          topics: {
            some: { topic: { slug: { contains: query, mode: 'insensitive' } } },
          },
        },
      );
    }

    return clauses;
  }

  private buildLectureSearchOr(
    query: string,
    includeRelated: boolean,
  ): Prisma.LectureWhereInput[] {
    const clauses: Prisma.LectureWhereInput[] = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];

    if (includeRelated) {
      clauses.push(
        { scholar: { name: { contains: query, mode: 'insensitive' } } },
        {
          topics: {
            some: { topic: { name: { contains: query, mode: 'insensitive' } } },
          },
        },
        {
          topics: {
            some: { topic: { slug: { contains: query, mode: 'insensitive' } } },
          },
        },
      );
    }

    return clauses;
  }

  private toCollectionViewDto(record: CollectionRecord): CollectionViewDto {
    return {
      id: record.id,
      scholarId: record.scholarId,
      slug: record.slug,
      title: record.title,
      description: record.description ?? undefined,
      coverImageUrl: record.coverImageUrl ?? undefined,
      language: record.language ?? undefined,
      status: record.status,
      orderIndex: record.orderIndex ?? undefined,
      deletedAt: record.deletedAt ? record.deletedAt.toISOString() : undefined,
      deleteAfterAt: record.deleteAfterAt
        ? record.deleteAfterAt.toISOString()
        : undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : undefined,
    };
  }

  private toSeriesViewDto(record: SeriesRecord): SeriesViewDto {
    return {
      id: record.id,
      scholarId: record.scholarId,
      collectionId: record.collectionId ?? undefined,
      slug: record.slug,
      title: record.title,
      description: record.description ?? undefined,
      coverImageUrl: record.coverImageUrl ?? undefined,
      language: record.language ?? undefined,
      status: record.status,
      orderIndex: record.orderIndex ?? undefined,
      deletedAt: record.deletedAt ? record.deletedAt.toISOString() : undefined,
      deleteAfterAt: record.deleteAfterAt
        ? record.deleteAfterAt.toISOString()
        : undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : undefined,
    };
  }

  private toLectureViewDto(record: LectureRecord): LectureViewDto {
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
      publishedAt: record.publishedAt
        ? record.publishedAt.toISOString()
        : undefined,
      orderIndex: record.orderIndex ?? undefined,
      durationSeconds: record.durationSeconds ?? undefined,
      primaryAudioAsset: primaryAudioAsset
        ? {
            id: primaryAudioAsset.id,
            lectureId: primaryAudioAsset.lectureId,
            url: this.toPublicUrl(primaryAudioAsset.url),
            format: primaryAudioAsset.format ?? undefined,
            bitrateKbps: primaryAudioAsset.bitrateKbps ?? undefined,
            sizeBytes:
              primaryAudioAsset.sizeBytes !== null
                ? Number(primaryAudioAsset.sizeBytes)
                : undefined,
            durationSeconds: primaryAudioAsset.durationSeconds ?? undefined,
            source: primaryAudioAsset.source ?? undefined,
            isPrimary: primaryAudioAsset.isPrimary,
            createdAt: primaryAudioAsset.createdAt.toISOString(),
          }
        : undefined,
      deletedAt: record.deletedAt ? record.deletedAt.toISOString() : undefined,
      deleteAfterAt: record.deleteAfterAt
        ? record.deleteAfterAt.toISOString()
        : undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : undefined,
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
