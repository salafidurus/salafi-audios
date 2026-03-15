import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/db';
import type { SearchCatalogItemDto } from '@sd/contracts';
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
  publishedLectureCount: true,
  publishedDurationSeconds: true,
  language: true,
  status: true,
  orderIndex: true,
  deletedAt: true,
  deleteAfterAt: true,
  createdAt: true,
  updatedAt: true,
  scholar: {
    select: {
      name: true,
      slug: true,
      imageUrl: true,
    },
  },
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
  publishedLectureCount: true,
  publishedDurationSeconds: true,
  language: true,
  status: true,
  orderIndex: true,
  deletedAt: true,
  deleteAfterAt: true,
  createdAt: true,
  updatedAt: true,
  scholar: {
    select: {
      name: true,
      slug: true,
      imageUrl: true,
    },
  },
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
  scholar: {
    select: {
      name: true,
      slug: true,
      imageUrl: true,
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
  ): Promise<SearchCatalogItemDto[]> {
    const rows = await this.prisma.collection.findMany({
      where: this.collectionWhere(query, includeRelated),
      select: collectionSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    return rows.map((row) => this.toCollectionSearchItem(row));
  }

  async listRootSeries(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const rows = await this.prisma.series.findMany({
      where: this.seriesWhere(query, includeRelated),
      select: seriesSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    return rows.map((row) => this.toSeriesSearchItem(row));
  }

  async listRootLectures(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const rows = await this.prisma.lecture.findMany({
      where: this.lectureWhere(query, includeRelated),
      select: lectureSelect,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      take,
    });

    return rows.map((row) => this.toLectureSearchItem(row));
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

  private toCollectionSearchItem(
    record: CollectionRecord,
  ): SearchCatalogItemDto {
    return {
      id: record.id,
      slug: record.slug,
      title: record.title,
      scholarName: record.scholar.name,
      scholarSlug: record.scholar.slug,
      coverImageUrl: this.toOptionalPublicUrl(record.coverImageUrl),
      scholarImageUrl: this.toOptionalPublicUrl(record.scholar.imageUrl),
      lectureCount: record.publishedLectureCount ?? 0,
      durationSeconds: record.publishedDurationSeconds ?? undefined,
    };
  }

  private toSeriesSearchItem(record: SeriesRecord): SearchCatalogItemDto {
    return {
      id: record.id,
      slug: record.slug,
      title: record.title,
      scholarName: record.scholar.name,
      scholarSlug: record.scholar.slug,
      coverImageUrl: this.toOptionalPublicUrl(record.coverImageUrl),
      scholarImageUrl: this.toOptionalPublicUrl(record.scholar.imageUrl),
      lectureCount: record.publishedLectureCount ?? 0,
      durationSeconds: record.publishedDurationSeconds ?? undefined,
    };
  }

  private toLectureSearchItem(record: LectureRecord): SearchCatalogItemDto {
    return {
      id: record.id,
      slug: record.slug,
      title: record.title,
      scholarName: record.scholar.name,
      scholarSlug: record.scholar.slug,
      scholarImageUrl: this.toOptionalPublicUrl(record.scholar.imageUrl),
      lectureCount: 1,
      durationSeconds: record.durationSeconds ?? undefined,
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

  private toOptionalPublicUrl(value?: string | null): string | undefined {
    if (!value) return undefined;
    return this.toPublicUrl(value);
  }
}
