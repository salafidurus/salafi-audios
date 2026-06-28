import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Status } from '@sd/core-db';
import type { ScholarChipDto, ContentSuggestionDto, RecentProgressDto } from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/utils/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

@Injectable()
export class HomeRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getScholars(): Promise<ScholarChipDto[]> {
    const locale = getRequestLocale();
    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { isKibar: 'desc' }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        mainLanguage: true,
        translations: {
          where: { locale, status: 'published' },
          select: { name: true },
          take: 1,
        },
      },
    });

    return records.map((r) => {
      const resolved = resolveContentTranslation({
        base: { name: r.name },
        originalLanguage: r.mainLanguage,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      return {
        id: r.id,
        name: resolved.fields.name,
        slug: r.slug,
        imageUrl: r.imageUrl,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { name: resolved.original.name } : undefined,
      };
    });
  }

  async getSuggestions(): Promise<ContentSuggestionDto[]> {
    const locale = getRequestLocale();
    const records = await this.prisma.lecture.findMany({
      where: {
        status: Status.published,
        deletedAt: null,
        scholar: { isActive: true },
      },
      include: {
        translations: {
          where: { locale, status: 'published' },
          select: { title: true },
          take: 1,
        },
        scholar: {
          select: {
            name: true,
            slug: true,
            mainLanguage: true,
            translations: {
              where: { locale, status: 'published' },
              select: { name: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    return records.map((r) => {
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      const scholarName = resolveContentTranslation({
        base: { name: r.scholar.name },
        originalLanguage: r.scholar.mainLanguage,
        targetLocale: locale,
        publishedTranslation: r.scholar.translations[0] ?? null,
      }).fields.name;
      return {
        id: r.id,
        title: resolved.fields.title,
        slug: r.slug,
        kind: 'single' as const,
        scholarName,
        scholarSlug: r.scholar.slug,
        thumbnailUrl: null,
        durationSeconds: r.durationSeconds,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    });
  }

  async getRecentProgress(userId: string): Promise<RecentProgressDto | null> {
    const locale = getRequestLocale();
    const record = await this.prisma.userLectureProgress.findFirst({
      where: {
        userId,
        isCompleted: false,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        lecture: {
          select: {
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
                name: true,
                mainLanguage: true,
                translations: {
                  where: { locale, status: 'published' },
                  select: { name: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!record) return null;

    const lectureTitle = resolveContentTranslation({
      base: { title: record.lecture.title },
      originalLanguage: record.lecture.language,
      targetLocale: locale,
      publishedTranslation: record.lecture.translations[0] ?? null,
    }).fields.title;
    const scholarName = resolveContentTranslation({
      base: { name: record.lecture.scholar.name },
      originalLanguage: record.lecture.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: record.lecture.scholar.translations[0] ?? null,
    }).fields.name;

    return {
      lectureId: record.lecture.id,
      lectureTitle,
      lectureSlug: record.lecture.slug,
      scholarName,
      durationSeconds: record.lecture.durationSeconds ?? 0,
      positionSeconds: record.positionSeconds,
    };
  }
}
