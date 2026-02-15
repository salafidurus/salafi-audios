import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import {
  AnalyticsContentKind,
  AnalyticsEventType,
  Prisma,
  RecommendationRecurrence,
  Status,
} from '@sd/db';
import { RecommendationHeroItemDto } from './dto/recommendation-hero-item.dto';
import { RecommendationItemDto } from './dto/recommendation-item.dto';
import { RecommendationPageDto } from './dto/recommendation-page.dto';
import { decodeCursor, encodeCursor } from './recommendations.cursor';

const DEFAULT_LIMIT = 8;
const HERO_LIMIT = 10;
const DEFAULT_WINDOW_DAYS = 30;
const FALLBACK_WINDOW_DAYS = 90;

type OverrideFields = {
  recommendationOverride: boolean;
  recommendationStartAt: Date | null;
  recommendationEndAt: Date | null;
  recommendationRecurrence: RecommendationRecurrence | null;
};

const seriesSelect = {
  id: true,
  slug: true,
  title: true,
  coverImageUrl: true,
  collectionId: true,
  publishedLectureCount: true,
  publishedDurationSeconds: true,
  recommendationOverride: true,
  recommendationStartAt: true,
  recommendationEndAt: true,
  recommendationRecurrence: true,
  createdAt: true,
  scholar: {
    select: { name: true, slug: true, isActive: true, isKibar: true },
  },
} satisfies Prisma.SeriesSelect;

const collectionSelect = {
  id: true,
  slug: true,
  title: true,
  coverImageUrl: true,
  publishedLectureCount: true,
  publishedDurationSeconds: true,
  recommendationOverride: true,
  recommendationStartAt: true,
  recommendationEndAt: true,
  recommendationRecurrence: true,
  createdAt: true,
  scholar: {
    select: { name: true, slug: true, isActive: true, isKibar: true },
  },
} satisfies Prisma.CollectionSelect;

const lectureSelect = {
  id: true,
  slug: true,
  title: true,
  durationSeconds: true,
  seriesId: true,
  recommendationOverride: true,
  recommendationStartAt: true,
  recommendationEndAt: true,
  recommendationRecurrence: true,
  publishedAt: true,
  createdAt: true,
  scholar: {
    select: { name: true, slug: true, isActive: true, isKibar: true },
  },
  series: { select: { coverImageUrl: true } },
} satisfies Prisma.LectureSelect;

type SeriesRecord = Prisma.SeriesGetPayload<{ select: typeof seriesSelect }>;
type CollectionRecord = Prisma.CollectionGetPayload<{
  select: typeof collectionSelect;
}>;
type LectureRecord = Prisma.LectureGetPayload<{ select: typeof lectureSelect }>;

type RecommendationCandidate = {
  kind: 'series' | 'collection' | 'lecture';
  priority: number;
  sortAt: Date;
  record: SeriesRecord | CollectionRecord | LectureRecord;
};

@Injectable()
export class RecommendationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listHeroItems(
    limit: number = HERO_LIMIT,
  ): Promise<RecommendationHeroItemDto[]> {
    const effectiveLimit = Math.min(Math.max(1, limit), HERO_LIMIT);
    const now = new Date();
    const picked: RecommendationHeroItemDto[] = [];
    const pickedIds = new Set<string>();
    const configured = await this.listConfiguredHeroItems(now, effectiveLimit);

    for (const item of configured) {
      if (picked.length >= effectiveLimit) break;
      if (pickedIds.has(item.entityId)) continue;
      picked.push(item);
      pickedIds.add(item.entityId);
    }

    if (picked.length >= effectiveLimit) {
      return picked;
    }

    const desired = [
      {
        kind: 'series' as const,
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
        kind: 'series' as const,
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
        kind: 'series' as const,
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

    const pickDesired = async (d: (typeof desired)[number]): Promise<void> => {
      const whereBase = {
        status: Status.published,
        deletedAt: null,
        OR: d.matchAny.map((term) => ({
          title: { contains: term, mode: 'insensitive' as const },
        })),
        scholar: { isActive: true },
      };

      const kindOrder = [d.kind ?? 'series', 'collection', 'lecture'] as const;

      for (const kind of kindOrder) {
        if (kind === 'series') {
          const row = await this.prisma.series.findFirst({
            where: whereBase,
            select: seriesSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          });

          if (
            row &&
            !pickedIds.has(row.id) &&
            this.isSeriesEligible(row, now)
          ) {
            picked.push(await this.toHeroSeries(row, d.headline));
            pickedIds.add(row.id);
            return;
          }
        }

        if (kind === 'collection') {
          const row = await this.prisma.collection.findFirst({
            where: whereBase,
            select: collectionSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          });

          if (row && !pickedIds.has(row.id)) {
            picked.push(await this.toHeroCollection(row, d.headline));
            pickedIds.add(row.id);
            return;
          }
        }

        if (kind === 'lecture') {
          const row = await this.prisma.lecture.findFirst({
            where: whereBase,
            select: lectureSelect,
            orderBy: [
              { publishedAt: 'desc' },
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
          });

          if (
            row &&
            !pickedIds.has(row.id) &&
            this.isLectureEligible(row, now)
          ) {
            picked.push(await this.toHeroLecture(row, d.headline));
            pickedIds.add(row.id);
            return;
          }
        }
      }
    };

    for (const d of desired) {
      await pickDesired(d);
    }

    if (picked.length < effectiveLimit) {
      const remaining = Math.max(0, effectiveLimit - picked.length);
      const [fallbackSeries, fallbackCollections, fallbackLectures] =
        await Promise.all([
          this.prisma.series.findMany({
            where: {
              status: Status.published,
              deletedAt: null,
              scholar: { isActive: true },
              OR: [{ collectionId: null }, { recommendationOverride: true }],
              ...(pickedIds.size > 0
                ? { id: { notIn: Array.from(pickedIds) } }
                : {}),
            },
            select: seriesSelect,
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
            select: collectionSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: remaining,
          }),
          this.prisma.lecture.findMany({
            where: {
              status: Status.published,
              deletedAt: null,
              scholar: { isActive: true },
              OR: [{ seriesId: null }, { recommendationOverride: true }],
              ...(pickedIds.size > 0
                ? { id: { notIn: Array.from(pickedIds) } }
                : {}),
            },
            select: lectureSelect,
            orderBy: [
              { publishedAt: 'desc' },
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
            take: remaining,
          }),
        ]);

      const merged: RecommendationHeroItemDto[] = [];

      for (const row of fallbackSeries) {
        if (merged.length >= remaining) break;
        if (!this.isSeriesEligible(row, now)) continue;
        merged.push(
          await this.toHeroSeries(row, fallbackHeadlines[0] ?? 'Featured'),
        );
      }

      for (const row of fallbackCollections) {
        if (merged.length >= remaining) break;
        merged.push(
          await this.toHeroCollection(
            row,
            fallbackHeadlines[1] ?? fallbackHeadlines[0] ?? 'Featured',
          ),
        );
      }

      for (const row of fallbackLectures) {
        if (merged.length >= remaining) break;
        if (!this.isLectureEligible(row, now)) continue;
        merged.push(
          await this.toHeroLecture(
            row,
            fallbackHeadlines[2] ?? fallbackHeadlines[0] ?? 'Featured',
          ),
        );
      }

      for (const item of merged) {
        if (picked.length >= effectiveLimit) break;
        if (pickedIds.has(item.entityId)) continue;
        picked.push(item);
        pickedIds.add(item.entityId);
      }
    }

    return picked.slice(0, effectiveLimit);
  }

  async listRecommendedKibar(
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    const [seriesRows, collectionRows, lectureRows] = await Promise.all([
      this.prisma.series.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true, isKibar: true },
        },
        select: seriesSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.collection.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true, isKibar: true },
        },
        select: collectionSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.lecture.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true, isKibar: true },
        },
        select: lectureSelect,
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    ]);

    const items = await this.buildRecommendationList({
      seriesRows,
      collectionRows,
      lectureRows,
      limit,
    });
    if (items.length === 0) {
      const fallback = await this.listLatestItems();
      return this.paginate(fallback, limit, cursor);
    }
    return this.paginate(items, limit, cursor);
  }

  async listRecommendedRecentPlay(
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    const items = await this.listByAnalytics({
      eventTypes: [AnalyticsEventType.play, AnalyticsEventType.complete],
      windowDays: DEFAULT_WINDOW_DAYS,
    });

    if (items.length === 0) {
      const fallback = await this.listLatestItems();
      return this.paginate(fallback, limit, cursor);
    }

    return this.paginate(items, limit, cursor);
  }

  async listRecommendedTopics(
    topicsCsv: string | undefined,
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    const topicSlugs = await this.resolveTopicSlugs(topicsCsv);
    const items = await this.listByTopics(topicSlugs);
    return this.paginate(items, limit, cursor);
  }

  async listFollowingScholars(
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.paginate([], limit, cursor);
  }

  async listFollowingTopics(
    topicsCsv: string | undefined,
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    if (!topicsCsv) return this.paginate([], limit, cursor);
    const topicSlugs = await this.resolveTopicSlugs(topicsCsv);
    const items = await this.listByTopics(topicSlugs);
    return this.paginate(items, limit, cursor);
  }

  async listLatest(
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    const items = await this.listLatestItems();
    return this.paginate(items, limit, cursor);
  }

  async listLatestTopics(
    topicsCsv: string | undefined,
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    if (!topicsCsv) return this.paginate([], limit, cursor);
    const topicSlugs = await this.resolveTopicSlugs(topicsCsv);
    const items = await this.listLatestByTopics(topicSlugs);
    return this.paginate(items, limit, cursor);
  }

  async listPopular(
    windowDays: number | undefined,
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    const items = await this.listPopularItems(windowDays);
    return this.paginate(items, limit, cursor);
  }

  async listPopularTopics(
    topicsCsv: string | undefined,
    windowDays: number | undefined,
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    const topicSlugs = await this.resolveTopicSlugs(topicsCsv);
    const items = await this.listPopularItems(windowDays, topicSlugs);
    return this.paginate(items, limit, cursor);
  }

  private async buildRecommendationList({
    seriesRows,
    collectionRows,
    lectureRows,
    limit,
  }: {
    seriesRows: SeriesRecord[];
    collectionRows: CollectionRecord[];
    lectureRows: LectureRecord[];
    limit: number;
  }): Promise<RecommendationItemDto[]> {
    const now = new Date();
    const candidates: RecommendationCandidate[] = [];

    for (const row of seriesRows) {
      if (!this.isSeriesEligible(row, now)) continue;
      const priority = this.isOverrideActive(row, now)
        ? 3
        : this.isStandaloneSeries(row)
          ? 2
          : 1;
      candidates.push({
        kind: 'series',
        priority,
        sortAt: row.createdAt,
        record: row,
      });
    }

    for (const row of collectionRows) {
      const priority = this.isOverrideActive(row, now) ? 3 : 2;
      candidates.push({
        kind: 'collection',
        priority,
        sortAt: row.createdAt,
        record: row,
      });
    }

    for (const row of lectureRows) {
      if (!this.isLectureEligible(row, now)) continue;
      const priority = this.isOverrideActive(row, now)
        ? 3
        : this.isStandaloneLecture(row)
          ? 2
          : 1;
      candidates.push({
        kind: 'lecture',
        priority,
        sortAt: row.publishedAt ?? row.createdAt,
        record: row,
      });
    }

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.sortAt.getTime() - a.sortAt.getTime();
    });

    const seen = new Set<string>();
    const items: RecommendationItemDto[] = [];
    const maxItems = Math.max(limit * 4, DEFAULT_LIMIT * 2);

    for (const candidate of candidates) {
      if (items.length >= maxItems) break;
      const entityId = candidate.record.id;
      if (seen.has(entityId)) continue;
      seen.add(entityId);

      if (candidate.kind === 'series') {
        items.push(this.toSeriesItem(candidate.record as SeriesRecord));
      } else if (candidate.kind === 'collection') {
        items.push(this.toCollectionItem(candidate.record as CollectionRecord));
      } else {
        items.push(await this.toLectureItem(candidate.record as LectureRecord));
      }
    }

    return items;
  }

  private async listLatestItems(): Promise<RecommendationItemDto[]> {
    const [seriesRows, collectionRows, lectureRows] = await Promise.all([
      this.prisma.series.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
        },
        select: seriesSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.collection.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
        },
        select: collectionSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.lecture.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
        },
        select: lectureSelect,
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    ]);

    const now = new Date();
    const items: RecommendationItemDto[] = [];
    const all: Array<{
      kind: 'series' | 'collection' | 'lecture';
      sortAt: Date;
      record: SeriesRecord | CollectionRecord | LectureRecord;
    }> = [];

    for (const row of seriesRows) {
      if (!this.isSeriesEligible(row, now)) continue;
      all.push({ kind: 'series', sortAt: row.createdAt, record: row });
    }

    for (const row of collectionRows) {
      all.push({ kind: 'collection', sortAt: row.createdAt, record: row });
    }

    for (const row of lectureRows) {
      if (!this.isLectureEligible(row, now)) continue;
      all.push({
        kind: 'lecture',
        sortAt: row.publishedAt ?? row.createdAt,
        record: row,
      });
    }

    all.sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime());

    for (const item of all) {
      if (item.kind === 'series') {
        items.push(this.toSeriesItem(item.record as SeriesRecord));
      } else if (item.kind === 'collection') {
        items.push(this.toCollectionItem(item.record as CollectionRecord));
      } else {
        items.push(await this.toLectureItem(item.record as LectureRecord));
      }
    }

    return items;
  }

  private async listLatestByTopics(
    topicSlugs: string[],
  ): Promise<RecommendationItemDto[]> {
    if (topicSlugs.length === 0) return [];

    const [seriesRows, collectionRows, lectureRows] = await Promise.all([
      this.prisma.series.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: { in: topicSlugs } } } },
        },
        select: seriesSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.collection.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: { in: topicSlugs } } } },
        },
        select: collectionSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.lecture.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: { in: topicSlugs } } } },
        },
        select: lectureSelect,
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    ]);

    const now = new Date();
    const rows: Array<{
      kind: 'series' | 'collection' | 'lecture';
      sortAt: Date;
      record: SeriesRecord | CollectionRecord | LectureRecord;
    }> = [];

    for (const row of seriesRows) {
      if (!this.isSeriesEligible(row, now)) continue;
      rows.push({ kind: 'series', sortAt: row.createdAt, record: row });
    }

    for (const row of collectionRows) {
      rows.push({ kind: 'collection', sortAt: row.createdAt, record: row });
    }

    for (const row of lectureRows) {
      if (!this.isLectureEligible(row, now)) continue;
      rows.push({
        kind: 'lecture',
        sortAt: row.publishedAt ?? row.createdAt,
        record: row,
      });
    }

    rows.sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime());

    const items: RecommendationItemDto[] = [];
    for (const row of rows) {
      if (row.kind === 'series') {
        items.push(this.toSeriesItem(row.record as SeriesRecord));
      } else if (row.kind === 'collection') {
        items.push(this.toCollectionItem(row.record as CollectionRecord));
      } else {
        items.push(await this.toLectureItem(row.record as LectureRecord));
      }
    }

    return items;
  }

  private async listPopularItems(
    windowDays?: number,
    topicSlugs?: string[],
  ): Promise<RecommendationItemDto[]> {
    const items = await this.listByAnalytics({
      eventTypes: [
        AnalyticsEventType.view,
        AnalyticsEventType.play,
        AnalyticsEventType.complete,
        AnalyticsEventType.save,
        AnalyticsEventType.share,
      ],
      windowDays: windowDays ?? DEFAULT_WINDOW_DAYS,
      topicSlugs,
    });

    if (items.length > 0) return items;

    if (topicSlugs?.length) {
      const topicFallback = await this.listLatestByTopics(topicSlugs);
      if (topicFallback.length > 0) return topicFallback;
    }

    if ((windowDays ?? DEFAULT_WINDOW_DAYS) !== FALLBACK_WINDOW_DAYS) {
      return this.listByAnalytics({
        eventTypes: [
          AnalyticsEventType.view,
          AnalyticsEventType.play,
          AnalyticsEventType.complete,
          AnalyticsEventType.save,
          AnalyticsEventType.share,
        ],
        windowDays: FALLBACK_WINDOW_DAYS,
        topicSlugs,
      });
    }

    return this.listLatestItems();
  }

  private async listByAnalytics({
    eventTypes,
    windowDays,
    topicSlugs,
  }: {
    eventTypes: AnalyticsEventType[];
    windowDays: number;
    topicSlugs?: string[];
  }): Promise<RecommendationItemDto[]> {
    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - windowDays);
    const take = DEFAULT_LIMIT * 6;

    const topicIds = topicSlugs?.length
      ? await this.prisma.topic.findMany({
          where: { slug: { in: topicSlugs } },
          select: { id: true },
        })
      : [];

    const allowedIds = topicIds.length
      ? await this.fetchContentIdsByTopics(topicIds.map((t) => t.id))
      : null;

    const [lectureScores, seriesScores, collectionScores] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ['contentId'],
        where: {
          contentKind: AnalyticsContentKind.lecture,
          eventType: { in: eventTypes },
          occurredAt: { gte: since },
          ...(allowedIds?.lectureIds?.length
            ? { contentId: { in: allowedIds.lectureIds } }
            : {}),
        },
        _sum: { weight: true },
        _max: { occurredAt: true },
        orderBy: [
          { _sum: { weight: 'desc' } },
          { _max: { occurredAt: 'desc' } },
        ],
        take,
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['contentId'],
        where: {
          contentKind: AnalyticsContentKind.series,
          eventType: { in: eventTypes },
          occurredAt: { gte: since },
          ...(allowedIds?.seriesIds?.length
            ? { contentId: { in: allowedIds.seriesIds } }
            : {}),
        },
        _sum: { weight: true },
        _max: { occurredAt: true },
        orderBy: [
          { _sum: { weight: 'desc' } },
          { _max: { occurredAt: 'desc' } },
        ],
        take,
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['contentId'],
        where: {
          contentKind: AnalyticsContentKind.collection,
          eventType: { in: eventTypes },
          occurredAt: { gte: since },
          ...(allowedIds?.collectionIds?.length
            ? { contentId: { in: allowedIds.collectionIds } }
            : {}),
        },
        _sum: { weight: true },
        _max: { occurredAt: true },
        orderBy: [
          { _sum: { weight: 'desc' } },
          { _max: { occurredAt: 'desc' } },
        ],
        take,
      }),
    ]);

    const ranked = [
      ...lectureScores.map((row) => ({
        kind: 'lecture' as const,
        id: row.contentId,
        score: row._sum.weight ?? 0,
        lastAt: row._max.occurredAt ?? now,
      })),
      ...seriesScores.map((row) => ({
        kind: 'series' as const,
        id: row.contentId,
        score: row._sum.weight ?? 0,
        lastAt: row._max.occurredAt ?? now,
      })),
      ...collectionScores.map((row) => ({
        kind: 'collection' as const,
        id: row.contentId,
        score: row._sum.weight ?? 0,
        lastAt: row._max.occurredAt ?? now,
      })),
    ].filter((row) => row.score > 0);

    ranked.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.lastAt.getTime() - a.lastAt.getTime();
    });

    if (ranked.length === 0) return [];

    const lectureIds = ranked
      .filter((r) => r.kind === 'lecture')
      .map((r) => r.id);
    const seriesIds = ranked
      .filter((r) => r.kind === 'series')
      .map((r) => r.id);
    const collectionIds = ranked
      .filter((r) => r.kind === 'collection')
      .map((r) => r.id);

    const [lectureRows, seriesRows, collectionRows] = await Promise.all([
      lectureIds.length
        ? this.prisma.lecture.findMany({
            where: {
              id: { in: lectureIds },
              status: Status.published,
              deletedAt: null,
            },
            select: lectureSelect,
          })
        : Promise.resolve([]),
      seriesIds.length
        ? this.prisma.series.findMany({
            where: {
              id: { in: seriesIds },
              status: Status.published,
              deletedAt: null,
            },
            select: seriesSelect,
          })
        : Promise.resolve([]),
      collectionIds.length
        ? this.prisma.collection.findMany({
            where: {
              id: { in: collectionIds },
              status: Status.published,
              deletedAt: null,
            },
            select: collectionSelect,
          })
        : Promise.resolve([]),
    ]);

    const nowCheck = new Date();
    const lectureMap = new Map(lectureRows.map((row) => [row.id, row]));
    const seriesMap = new Map(seriesRows.map((row) => [row.id, row]));
    const collectionMap = new Map(collectionRows.map((row) => [row.id, row]));
    const items: RecommendationItemDto[] = [];

    for (const entry of ranked) {
      if (entry.kind === 'lecture') {
        const row = lectureMap.get(entry.id);
        if (!row || !this.isLectureEligible(row, nowCheck)) continue;
        items.push(await this.toLectureItem(row));
        continue;
      }

      if (entry.kind === 'series') {
        const row = seriesMap.get(entry.id);
        if (!row || !this.isSeriesEligible(row, nowCheck)) continue;
        items.push(this.toSeriesItem(row));
        continue;
      }

      const row = collectionMap.get(entry.id);
      if (!row) continue;
      items.push(this.toCollectionItem(row));
    }

    return items;
  }

  private async listByTopics(
    topicSlugs: string[],
  ): Promise<RecommendationItemDto[]> {
    if (topicSlugs.length === 0) return [];

    const [seriesRows, collectionRows, lectureRows] = await Promise.all([
      this.prisma.series.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: { in: topicSlugs } } } },
        },
        select: seriesSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.collection.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: { in: topicSlugs } } } },
        },
        select: collectionSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.lecture.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: { in: topicSlugs } } } },
        },
        select: lectureSelect,
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
    ]);

    return this.buildRecommendationList({
      seriesRows,
      collectionRows,
      lectureRows,
      limit: Math.max(DEFAULT_LIMIT * 3, 24),
    });
  }

  private async resolveTopicSlugs(topicsCsv?: string): Promise<string[]> {
    if (topicsCsv) {
      return topicsCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const topics = await this.prisma.topic.findMany({
      select: { slug: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    const slugs = topics.map((t) => t.slug);
    for (let i = slugs.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [slugs[i], slugs[j]] = [slugs[j], slugs[i]];
    }

    return slugs.slice(0, 2);
  }

  private async fetchContentIdsByTopics(topicIds: string[]): Promise<{
    lectureIds: string[];
    seriesIds: string[];
    collectionIds: string[];
  }> {
    const [lectureTopics, seriesTopics, collectionTopics] = await Promise.all([
      this.prisma.lectureTopic.findMany({
        where: { topicId: { in: topicIds } },
        select: { lectureId: true },
      }),
      this.prisma.seriesTopic.findMany({
        where: { topicId: { in: topicIds } },
        select: { seriesId: true },
      }),
      this.prisma.collectionTopic.findMany({
        where: { topicId: { in: topicIds } },
        select: { collectionId: true },
      }),
    ]);

    return {
      lectureIds: lectureTopics.map((row) => row.lectureId),
      seriesIds: seriesTopics.map((row) => row.seriesId),
      collectionIds: collectionTopics.map((row) => row.collectionId),
    };
  }

  private async listConfiguredHeroItems(
    now: Date,
    limit: number,
  ): Promise<RecommendationHeroItemDto[]> {
    const configs = await this.prisma.recommendationHero.findMany({
      where: {
        isActive: true,
        ...(now
          ? {
              OR: [
                { startAt: null, endAt: null },
                {
                  startAt: { lte: now },
                  endAt: { gte: now },
                },
                {
                  startAt: { lte: now },
                  endAt: null,
                },
                {
                  startAt: null,
                  endAt: { gte: now },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });

    const items: RecommendationHeroItemDto[] = [];

    for (const config of configs) {
      if (config.entityKind === AnalyticsContentKind.series) {
        const row = await this.prisma.series.findFirst({
          where: {
            id: config.entityId,
            status: Status.published,
            deletedAt: null,
            scholar: { isActive: true },
          },
          select: seriesSelect,
        });
        if (row && this.isSeriesEligible(row, now)) {
          items.push(await this.toHeroSeries(row, config.headline));
        }
        continue;
      }

      if (config.entityKind === AnalyticsContentKind.collection) {
        const row = await this.prisma.collection.findFirst({
          where: {
            id: config.entityId,
            status: Status.published,
            deletedAt: null,
            scholar: { isActive: true },
          },
          select: collectionSelect,
        });
        if (row) {
          items.push(await this.toHeroCollection(row, config.headline));
        }
        continue;
      }

      const row = await this.prisma.lecture.findFirst({
        where: {
          id: config.entityId,
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
        },
        select: lectureSelect,
      });
      if (row && this.isLectureEligible(row, now)) {
        items.push(await this.toHeroLecture(row, config.headline));
      }
    }

    return items;
  }

  private paginate(
    items: RecommendationItemDto[],
    limit: number,
    cursor?: string,
  ): RecommendationPageDto {
    const normalizedLimit = Math.min(Math.max(1, limit), 24);
    const offset = cursor ? (decodeCursor(cursor)?.offset ?? 0) : 0;
    const slice = items.slice(offset, offset + normalizedLimit);
    const nextOffset = offset + normalizedLimit;

    return {
      items: slice,
      nextCursor:
        nextOffset < items.length
          ? encodeCursor({ offset: nextOffset })
          : undefined,
    };
  }

  private isOverrideActive(record: OverrideFields, now: Date): boolean {
    if (!record.recommendationOverride) return false;
    const start = record.recommendationStartAt;
    const end = record.recommendationEndAt;
    const recurrence =
      record.recommendationRecurrence ?? RecommendationRecurrence.none;

    if (!start && !end) return true;

    if (recurrence === RecommendationRecurrence.yearly && start && end) {
      const startAt = new Date(now);
      startAt.setMonth(start.getMonth(), start.getDate());
      startAt.setHours(
        start.getHours(),
        start.getMinutes(),
        start.getSeconds(),
        0,
      );

      const endAt = new Date(now);
      endAt.setMonth(end.getMonth(), end.getDate());
      endAt.setHours(end.getHours(), end.getMinutes(), end.getSeconds(), 0);

      if (startAt <= endAt) {
        return now >= startAt && now <= endAt;
      }

      return now >= startAt || now <= endAt;
    }

    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }

  private isStandaloneSeries(row: SeriesRecord): boolean {
    return row.collectionId == null;
  }

  private isStandaloneLecture(row: LectureRecord): boolean {
    return row.seriesId == null;
  }

  private isSeriesEligible(row: SeriesRecord, now: Date): boolean {
    return this.isStandaloneSeries(row) || this.isOverrideActive(row, now);
  }

  private isLectureEligible(row: LectureRecord, now: Date): boolean {
    return this.isStandaloneLecture(row) || this.isOverrideActive(row, now);
  }

  private toSeriesItem(row: SeriesRecord): RecommendationItemDto {
    return {
      kind: 'series',
      entityId: row.id,
      entitySlug: row.slug,
      title: row.title,
      coverImageUrl: row.coverImageUrl ?? undefined,
      lessonCount: row.publishedLectureCount ?? undefined,
      totalDurationSeconds: row.publishedDurationSeconds ?? undefined,
      scholarName: row.scholar.name,
      scholarSlug: row.scholar.slug,
    };
  }

  private toCollectionItem(row: CollectionRecord): RecommendationItemDto {
    return {
      kind: 'collection',
      entityId: row.id,
      entitySlug: row.slug,
      title: row.title,
      coverImageUrl: row.coverImageUrl ?? undefined,
      lessonCount: row.publishedLectureCount ?? undefined,
      totalDurationSeconds: row.publishedDurationSeconds ?? undefined,
      scholarName: row.scholar.name,
      scholarSlug: row.scholar.slug,
    };
  }

  private async toLectureItem(
    row: LectureRecord,
  ): Promise<RecommendationItemDto> {
    const totalDurationSeconds = await this.resolveLectureDuration(row);

    return {
      kind: 'lecture',
      entityId: row.id,
      entitySlug: row.slug,
      title: row.title,
      coverImageUrl: row.series?.coverImageUrl ?? undefined,
      lessonCount: 1,
      totalDurationSeconds,
      scholarName: row.scholar.name,
      scholarSlug: row.scholar.slug,
    };
  }

  private async resolveLectureDuration(
    row: LectureRecord,
  ): Promise<number | undefined> {
    if (row.durationSeconds != null) return row.durationSeconds ?? undefined;

    const agg = await this.prisma.audioAsset.aggregate({
      where: { lectureId: row.id, isPrimary: true },
      _sum: { durationSeconds: true },
    });

    return agg._sum.durationSeconds ?? undefined;
  }

  private async toHeroSeries(
    row: SeriesRecord,
    headline: string,
  ): Promise<RecommendationHeroItemDto> {
    return {
      kind: 'series',
      entityId: row.id,
      entitySlug: row.slug,
      headline,
      title: row.title,
      description: undefined,
      coverImageUrl: row.coverImageUrl ?? undefined,
      lessonCount: row.publishedLectureCount ?? undefined,
      totalDurationSeconds: row.publishedDurationSeconds ?? undefined,
      presentedBy: row.scholar.name,
      presentedBySlug: row.scholar.slug,
    };
  }

  private async toHeroCollection(
    row: CollectionRecord,
    headline: string,
  ): Promise<RecommendationHeroItemDto> {
    return {
      kind: 'collection',
      entityId: row.id,
      entitySlug: row.slug,
      headline,
      title: row.title,
      description: undefined,
      coverImageUrl: row.coverImageUrl ?? undefined,
      lessonCount: row.publishedLectureCount ?? undefined,
      totalDurationSeconds: row.publishedDurationSeconds ?? undefined,
      presentedBy: row.scholar.name,
      presentedBySlug: row.scholar.slug,
    };
  }

  private async toHeroLecture(
    row: LectureRecord,
    headline: string,
  ): Promise<RecommendationHeroItemDto> {
    const totalDurationSeconds = await this.resolveLectureDuration(row);

    return {
      kind: 'lecture',
      entityId: row.id,
      entitySlug: row.slug,
      headline,
      title: row.title,
      description: undefined,
      coverImageUrl: row.series?.coverImageUrl ?? undefined,
      lessonCount: 1,
      totalDurationSeconds,
      presentedBy: row.scholar.name,
      presentedBySlug: row.scholar.slug,
    };
  }
}
