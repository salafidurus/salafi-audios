import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/db/prisma.service';
import { Prisma, RecommendationRecurrence, Status } from '@sd/db';
import { RecommendationHeroItemDto } from './dto/recommendation-hero-item.dto';
import { RecommendationItemDto } from './dto/recommendation-item.dto';
import { RecommendationPageDto } from './dto/recommendation-page.dto';
import { decodeCursor, encodeCursor } from './recommendations.cursor';

const DEFAULT_LIMIT = 8;
const HERO_LIMIT = 3;

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
    const now = new Date();
    const picked: RecommendationHeroItemDto[] = [];
    const pickedIds = new Set<string>();

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

  async listKibarItems(
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
    return this.paginate(items, limit, cursor);
  }

  async listTopicItems(
    topicSlug: string,
    limit = DEFAULT_LIMIT,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    const [seriesRows, collectionRows, lectureRows] = await Promise.all([
      this.prisma.series.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: topicSlug } } },
        },
        select: seriesSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.collection.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: topicSlug } } },
        },
        select: collectionSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.lecture.findMany({
        where: {
          status: Status.published,
          deletedAt: null,
          scholar: { isActive: true },
          topics: { some: { topic: { slug: topicSlug } } },
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

    for (const candidate of candidates) {
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
