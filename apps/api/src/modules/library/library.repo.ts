import { Injectable } from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import type { Locale, LibraryItemDto } from '@sd/core-contracts';
import { PrismaService } from '../../shared/db/prisma.service';
import { resolveContentTranslation } from '../../shared/utils/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

const DEFAULT_PAGE_SIZE = 20;

const lectureRelationSelect = (locale: Locale) =>
  ({
    id: true,
    title: true,
    slug: true,
    language: true,
    durationSeconds: true,
    translations: {
      where: { locale, status: 'published' },
      select: { title: true },
      take: 1,
    },
    scholar: {
      select: {
        id: true,
        slug: true,
        name: true,
        mainLanguage: true,
        translations: {
          where: { locale, status: 'published' },
          select: { name: true },
          take: 1,
        },
      },
    },
    series: {
      select: {
        title: true,
        language: true,
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
      },
    },
  }) satisfies Prisma.LectureSelect;

type LectureRelation = {
  id: string;
  title: string;
  slug: string;
  language: Locale | null;
  durationSeconds: number | null;
  translations: { title: string }[];
  scholar: {
    id: string;
    slug: string;
    name: string;
    mainLanguage: Locale | null;
    translations: { name: string }[];
  };
  series: {
    title: string;
    language: Locale | null;
    translations: { title: string }[];
  } | null;
};

@Injectable()
export class LibraryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInProgress(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;
    const locale = getRequestLocale();

    const records = await this.prisma.userLectureProgress.findMany({
      where: {
        userId,
        isCompleted: false,
        positionSeconds: { gt: 0 },
      },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_lectureId: { userId, lectureId: cursor } },
            skip: 1,
          }
        : {}),
      include: { lecture: { select: lectureRelationSelect(locale) } },
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.progressToDto(r, locale),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.lectureId : undefined;

    return { items, nextCursor };
  }

  async findCompleted(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;
    const locale = getRequestLocale();

    const records = await this.prisma.userLectureProgress.findMany({
      where: { userId, isCompleted: true },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_lectureId: { userId, lectureId: cursor } },
            skip: 1,
          }
        : {}),
      include: { lecture: { select: lectureRelationSelect(locale) } },
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.progressToDto(r, locale),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.lectureId : undefined;

    return { items, nextCursor };
  }

  async findSaved(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;
    const locale = getRequestLocale();

    const records = await this.prisma.favoriteLecture.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_lectureId: { userId, lectureId: cursor } },
            skip: 1,
          }
        : {}),
      include: { lecture: { select: lectureRelationSelect(locale) } },
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.favoriteToDto(r, locale),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.lectureId : undefined;

    return { items, nextCursor };
  }

  async saveLecture(userId: string, lectureId: string): Promise<void> {
    await this.prisma.favoriteLecture.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      create: { userId, lectureId },
      update: {},
    });
  }

  async unsaveLecture(userId: string, lectureId: string): Promise<void> {
    await this.prisma.favoriteLecture.deleteMany({
      where: { userId, lectureId },
    });
  }

  async bulkSave(userId: string, lectureIds: string[]): Promise<void> {
    if (lectureIds.length === 0) return;

    const operations = lectureIds.map((lectureId) =>
      this.prisma.favoriteLecture.upsert({
        where: { userId_lectureId: { userId, lectureId } },
        create: { userId, lectureId },
        update: {},
      }),
    );
    await this.prisma.$transaction(operations);
  }

  /** Shared resolution of the translatable lecture relation shared by the
   * progress- and favorite-backed library item shapes. */
  private resolveLectureRelation(
    lecture: LectureRelation,
    locale: Locale,
  ): Pick<
    LibraryItemDto,
    | 'lectureTitle'
    | 'lectureSlug'
    | 'scholarId'
    | 'scholarSlug'
    | 'scholarName'
    | 'seriesTitle'
    | 'durationSeconds'
    | 'originalLanguage'
    | 'originalLectureTitle'
  > {
    const resolved = resolveContentTranslation({
      base: { title: lecture.title },
      originalLanguage: lecture.language,
      targetLocale: locale,
      publishedTranslation: lecture.translations[0] ?? null,
    });
    const scholarName = resolveContentTranslation({
      base: { name: lecture.scholar.name },
      originalLanguage: lecture.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: lecture.scholar.translations[0] ?? null,
    }).fields.name;
    const seriesTitle = lecture.series
      ? resolveContentTranslation({
          base: { title: lecture.series.title },
          originalLanguage: lecture.series.language,
          targetLocale: locale,
          publishedTranslation: lecture.series.translations[0] ?? null,
        }).fields.title
      : undefined;

    return {
      lectureTitle: resolved.fields.title,
      lectureSlug: lecture.slug,
      scholarId: lecture.scholar.id,
      scholarSlug: lecture.scholar.slug,
      scholarName,
      seriesTitle,
      durationSeconds: lecture.durationSeconds ?? undefined,
      originalLanguage: resolved.originalLanguage,
      originalLectureTitle: resolved.original?.title,
    };
  }

  private progressToDto(
    r: Prisma.UserLectureProgressGetPayload<{
      include: {
        lecture: { select: ReturnType<typeof lectureRelationSelect> };
      };
    }>,
    locale: Locale,
  ): LibraryItemDto {
    return {
      id: `${r.userId}-${r.lectureId}`,
      lectureId: r.lectureId,
      ...this.resolveLectureRelation(r.lecture, locale),
      progressSeconds: r.positionSeconds,
      completedAt: r.isCompleted ? r.updatedAt.toISOString() : undefined,
    };
  }

  private favoriteToDto(
    r: Prisma.FavoriteLectureGetPayload<{
      include: {
        lecture: { select: ReturnType<typeof lectureRelationSelect> };
      };
    }>,
    locale: Locale,
  ): LibraryItemDto {
    return {
      id: `${r.userId}-${r.lectureId}`,
      lectureId: r.lectureId,
      ...this.resolveLectureRelation(r.lecture, locale),
      savedAt: r.createdAt.toISOString(),
    };
  }
}
