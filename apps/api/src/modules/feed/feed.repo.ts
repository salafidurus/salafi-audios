import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Status } from '@sd/core-db';
import type {
  FeedContentItemDto,
  FeedItemDto,
  FeedPageDto,
  Locale,
  ScholarChipDto,
  FeedTopicRowDto,
  ContentSuggestionDto,
} from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/utils/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

@Injectable()
export class FeedRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(
    cursor?: string,
    limit = 20,
    topicSlugs?: string[],
    scholarSlugs?: string[],
  ): Promise<FeedPageDto> {
    const locale = getRequestLocale();
    const cursorDate = cursor ? new Date(cursor) : undefined;

    const where = {
      status: Status.published,
      deletedAt: null,
      scholar: { isActive: true },
      ...(cursorDate && { publishedAt: { lt: cursorDate } }),
      ...(scholarSlugs?.length && {
        scholar: { isActive: true, slug: { in: scholarSlugs } },
      }),
      ...(topicSlugs?.length && {
        topics: {
          some: {
            topic: { slug: { in: topicSlugs } },
          },
        },
      }),
    };

    // Fetch one extra to determine if there's a next page
    const lectures = await this.prisma.lecture.findMany({
      where,
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
            isFeatured: true,
            mainLanguage: true,
            translations: {
              where: { locale, status: 'published' },
              select: { name: true },
              take: 1,
            },
          },
        },
        topics: {
          include: {
            topic: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1,
    });

    const hasMore = lectures.length > limit;
    const page = hasMore ? lectures.slice(0, limit) : lectures;

    const contentItems: FeedContentItemDto[] = page.map((r) => {
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
        kind: 'single' as const,
        id: r.id,
        title: resolved.fields.title,
        slug: r.slug,
        scholarName,
        scholarSlug: r.scholar.slug,
        thumbnailUrl: null,
        durationSeconds: r.durationSeconds,
        publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    });

    // Build feed with mixed content and horizontal rows
    const items: FeedItemDto[] = [];
    const scholarRow = await this.getScholarRowItems(locale);
    let scholarRowInjected = false;
    let topicRowInjected = false;

    for (let i = 0; i < contentItems.length; i++) {
      items.push(contentItems[i]!);

      // Inject scholar row after 3rd item
      if (!scholarRowInjected && i === 3 && scholarRow.length > 0) {
        items.push({ kind: 'scholar_row', scholars: scholarRow });
        scholarRowInjected = true;
      }

      // Inject topic row after 7th item if we have topic suggestions
      if (!topicRowInjected && i === 7 && topicSlugs?.length) {
        const topicRow = await this.getTopicRowItems(topicSlugs[0]!, locale);
        if (topicRow) {
          items.push(topicRow);
          topicRowInjected = true;
        }
      }
    }

    const lastItem = page[page.length - 1];
    const nextCursor =
      hasMore && lastItem ? (lastItem.publishedAt ?? lastItem.createdAt).toISOString() : undefined;

    return { items, nextCursor };
  }

  async getFeedRecent(cursor?: string, limit = 20): Promise<FeedPageDto> {
    const locale = getRequestLocale();
    const cursorDate = cursor ? new Date(cursor) : undefined;

    const where = {
      status: Status.published,
      deletedAt: null,
      scholar: { isActive: true },
      ...(cursorDate && { createdAt: { lt: cursorDate } }),
    };

    const lectures = await this.prisma.lecture.findMany({
      where,
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
            isFeatured: true,
            mainLanguage: true,
            translations: {
              where: { locale, status: 'published' },
              select: { name: true },
              take: 1,
            },
          },
        },
        topics: {
          include: {
            topic: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit + 1,
    });

    const hasMore = lectures.length > limit;
    const page = hasMore ? lectures.slice(0, limit) : lectures;

    const items: FeedItemDto[] = page.map((r) => {
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
        kind: 'single' as const,
        id: r.id,
        title: resolved.fields.title,
        slug: r.slug,
        scholarName,
        scholarSlug: r.scholar.slug,
        thumbnailUrl: null,
        durationSeconds: r.durationSeconds,
        publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    });

    const lastItem = page[page.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.createdAt.toISOString() : undefined;

    return { items, nextCursor };
  }

  async getScholars(): Promise<ScholarChipDto[]> {
    return this.fetchScholarChips(getRequestLocale(), 12);
  }

  private async getScholarRowItems(locale: Locale): Promise<ScholarChipDto[]> {
    return this.fetchScholarChips(locale, 8);
  }

  private async fetchScholarChips(locale: Locale, take: number): Promise<ScholarChipDto[]> {
    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { isKibar: 'desc' }],
      take,
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

  private async getTopicRowItems(
    topicSlug: string,
    locale: Locale,
  ): Promise<FeedTopicRowDto | null> {
    // Get the topic name
    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { name: true },
    });

    if (!topic) return null;

    // Get recent lectures in this topic
    const lectures = await this.prisma.lecture.findMany({
      where: {
        status: Status.published,
        deletedAt: null,
        scholar: { isActive: true },
        topics: {
          some: {
            topic: { slug: topicSlug },
          },
        },
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
      take: 6,
    });

    const items: ContentSuggestionDto[] = lectures.map((lecture) => {
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
      return {
        kind: 'single' as const,
        id: lecture.id,
        title: resolved.fields.title,
        slug: lecture.slug,
        scholarName,
        scholarSlug: lecture.scholar.slug,
        thumbnailUrl: null,
        durationSeconds: lecture.durationSeconds,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    });

    if (items.length === 0) return null;

    return {
      kind: 'topic_row' as const,
      topicName: topic.name,
      items,
    };
  }
}
