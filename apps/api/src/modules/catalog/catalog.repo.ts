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
import { FeaturedHomeItemDto } from './dto/featured-home-item.dto';

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

  async listFeaturedHomeItems(limit = 3): Promise<FeaturedHomeItemDto[]> {
    type FeaturedKind = 'series' | 'collection' | 'lecture';
    type DesiredHero = {
      kind?: FeaturedKind;
      matchAny: string[];
      headline: string;
    };

    const desired: DesiredHero[] = [
      {
        kind: 'series',
        matchAny: [
          'Kitab ut-Tawhid',
          'Kitab at-Tawhid',
          'Kitaab ut-Tawhid',
          'Kitaab at-Tawhid',
          'Tawhid',
          'Tawheed',
        ],
        headline: 'Tawhid First',
      },
      {
        kind: 'series',
        matchAny: [
          'Aqeedah ar-Raziyayn',
          'Aqidah ar-Raziyayn',
          'Aqidah al-Raziyayn',
          'Raziyayn',
          'Imamayn',
          'الرازيين',
        ],
        headline: 'Learn Iman before Quran',
      },
      {
        kind: 'series',
        matchAny: [
          'Kitab ut-Taharah',
          'Kitab at-Taharah',
          'Taharah',
          'الطهارة',
        ],
        headline: 'Oh Allah, grant him Fiqh in the religion',
      },
    ];

    const fallbackHeadlines = desired.map((d) => d.headline);

    const featuredSeriesSelect = {
      ...seriesSelect,
      publishedLectureCount: true,
      publishedDurationSeconds: true,
      scholar: { select: { name: true, slug: true } },
    } satisfies Prisma.SeriesSelect;
    const featuredCollectionSelect = {
      ...collectionSelect,
      publishedLectureCount: true,
      publishedDurationSeconds: true,
      scholar: { select: { name: true, slug: true } },
    } satisfies Prisma.CollectionSelect;
    const featuredLectureSelect = {
      id: true,
      slug: true,
      title: true,
      description: true,
      createdAt: true,
      publishedAt: true,
      durationSeconds: true,
      status: true,
      deletedAt: true,
      scholar: { select: { name: true, slug: true } },
      series: { select: { coverImageUrl: true } },
    } satisfies Prisma.LectureSelect;

    type PickedItem =
      | {
          kind: 'series';
          headline: string;
          row: Prisma.SeriesGetPayload<{ select: typeof featuredSeriesSelect }>;
        }
      | {
          kind: 'collection';
          headline: string;
          row: Prisma.CollectionGetPayload<{
            select: typeof featuredCollectionSelect;
          }>;
        }
      | {
          kind: 'lecture';
          headline: string;
          row: Prisma.LectureGetPayload<{
            select: typeof featuredLectureSelect;
          }>;
        };

    const picked: PickedItem[] = [];
    const pickedIds = new Set<string>();

    const pickDesired = async (d: DesiredHero): Promise<void> => {
      const whereBase = {
        status: Status.published,
        deletedAt: null,
        OR: d.matchAny.map((term) => ({
          title: { contains: term, mode: 'insensitive' as const },
        })),
        scholar: { isActive: true },
      };

      const kindOrder: FeaturedKind[] = d.kind
        ? [d.kind]
        : ['series', 'collection', 'lecture'];

      for (const kind of kindOrder) {
        if (kind === 'series') {
          const row = await this.prisma.series.findFirst({
            where: whereBase,
            select: featuredSeriesSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          });
          if (row && !pickedIds.has(row.id)) {
            picked.push({
              kind: 'series',
              headline: d.headline,
              row,
            });
            pickedIds.add(row.id);
            return;
          }
        }

        if (kind === 'collection') {
          const row = await this.prisma.collection.findFirst({
            where: whereBase,
            select: featuredCollectionSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          });
          if (row && !pickedIds.has(row.id)) {
            picked.push({
              kind: 'collection',
              headline: d.headline,
              row,
            });
            pickedIds.add(row.id);
            return;
          }
        }

        if (kind === 'lecture') {
          const row = await this.prisma.lecture.findFirst({
            where: whereBase,
            select: featuredLectureSelect,
            orderBy: [
              { publishedAt: 'desc' },
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
          });
          if (row && !pickedIds.has(row.id)) {
            picked.push({
              kind: 'lecture',
              headline: d.headline,
              row,
            });
            pickedIds.add(row.id);
            return;
          }
        }
      }
    };

    for (const d of desired) {
      // sequential to preserve ordering and avoid over-querying
      await pickDesired(d);
    }

    if (picked.length < limit) {
      const remaining = Math.max(0, limit - picked.length);

      const [fallbackSeries, fallbackCollections, fallbackLectures] =
        await Promise.all([
          this.prisma.series.findMany({
            where: {
              status: Status.published,
              deletedAt: null,
              scholar: { isActive: true },
              ...(pickedIds.size > 0
                ? { id: { notIn: Array.from(pickedIds) } }
                : {}),
            },
            select: featuredSeriesSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: remaining,
          }),
          this.prisma.collection.findMany({
            where: {
              status: Status.published,
              deletedAt: null,
              scholar: { isActive: true },
              ...(pickedIds.size > 0
                ? { id: { notIn: Array.from(pickedIds) } }
                : {}),
            },
            select: featuredCollectionSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: remaining,
          }),
          this.prisma.lecture.findMany({
            where: {
              status: Status.published,
              deletedAt: null,
              scholar: { isActive: true },
              ...(pickedIds.size > 0
                ? { id: { notIn: Array.from(pickedIds) } }
                : {}),
            },
            select: featuredLectureSelect,
            orderBy: [
              { publishedAt: 'desc' },
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
            take: remaining,
          }),
        ]);

      const merged: PickedItem[] = [
        ...fallbackSeries.map((row) => ({
          kind: 'series' as const,
          headline: fallbackHeadlines[0] ?? 'Featured',
          row,
        })),
        ...fallbackCollections.map((row) => ({
          kind: 'collection' as const,
          headline: fallbackHeadlines[1] ?? fallbackHeadlines[0] ?? 'Featured',
          row,
        })),
        ...fallbackLectures.map((row) => ({
          kind: 'lecture' as const,
          headline: fallbackHeadlines[2] ?? fallbackHeadlines[0] ?? 'Featured',
          row,
        })),
      ];

      for (const item of merged) {
        if (picked.length >= limit) break;
        if (pickedIds.has(item.row.id)) continue;
        picked.push(item);
        pickedIds.add(item.row.id);
      }
    }

    const [lessonCounts, durationSums] = await Promise.all([
      Promise.all(
        picked.slice(0, limit).map((p) => {
          if (p.kind === 'lecture') return Promise.resolve(1);

          if (p.kind === 'collection') {
            return this.prisma.lecture.count({
              where: {
                status: Status.published,
                deletedAt: null,
                series: { collectionId: p.row.id },
              },
            });
          }

          return this.prisma.lecture.count({
            where: {
              seriesId: p.row.id,
              status: Status.published,
              deletedAt: null,
            },
          });
        }),
      ),
      Promise.all(
        picked.slice(0, limit).map(async (p) => {
          if (p.kind === 'lecture') return p.row.durationSeconds ?? 0;

          if (p.kind === 'collection') {
            const result = await this.prisma.lecture.aggregate({
              where: {
                status: Status.published,
                deletedAt: null,
                series: { collectionId: p.row.id },
              },
              _sum: { durationSeconds: true },
            });

            return result._sum.durationSeconds ?? 0;
          }

          const result = await this.prisma.lecture.aggregate({
            where: {
              status: Status.published,
              deletedAt: null,
              seriesId: p.row.id,
            },
            _sum: { durationSeconds: true },
          });

          return result._sum.durationSeconds ?? 0;
        }),
      ),
    ]);

    return picked.slice(0, limit).map((p, idx) => {
      if (p.kind === 'collection') {
        return {
          kind: 'collection',
          entityId: p.row.id,
          entitySlug: p.row.slug,
          headline: p.headline,
          title: p.row.title,
          description: p.row.description ?? undefined,
          coverImageUrl: p.row.coverImageUrl ?? undefined,
          lessonCount: lessonCounts[idx] ?? 0,
          totalDurationSeconds: durationSums[idx] ?? 0,
          presentedBy: p.row.scholar.name,
          presentedBySlug: p.row.scholar.slug,
        };
      }

      if (p.kind === 'lecture') {
        return {
          kind: 'lecture',
          entityId: p.row.id,
          entitySlug: p.row.slug,
          headline: p.headline,
          title: p.row.title,
          description: p.row.description ?? undefined,
          coverImageUrl: p.row.series?.coverImageUrl ?? undefined,
          lessonCount: lessonCounts[idx] ?? 1,
          totalDurationSeconds: durationSums[idx] ?? 0,
          presentedBy: p.row.scholar.name,
          presentedBySlug: p.row.scholar.slug,
        };
      }

      return {
        kind: 'series',
        entityId: p.row.id,
        entitySlug: p.row.slug,
        headline: p.headline,
        title: p.row.title,
        description: p.row.description ?? undefined,
        coverImageUrl: p.row.coverImageUrl ?? undefined,
        lessonCount: lessonCounts[idx] ?? 0,
        totalDurationSeconds: durationSums[idx] ?? 0,
        presentedBy: p.row.scholar.name,
        presentedBySlug: p.row.scholar.slug,
      };
    });
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
