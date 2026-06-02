import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Status } from '@sd/core-db';
import type {
  FeedContentItemDto,
  FeedItemDto,
  FeedPageDto,
  ScholarChipDto,
  FeedTopicRowDto,
  ContentSuggestionDto,
} from '@sd/core-contracts';

@Injectable()
export class FeedRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(
    cursor?: string,
    limit = 20,
    topicSlugs?: string[],
    scholarSlugs?: string[],
  ): Promise<FeedPageDto> {
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
            topic: { slug: { in: topicSlugs } }
          }
        }
      }),
    };

    // Fetch one extra to determine if there's a next page
    const lectures = await this.prisma.lecture.findMany({
      where,
      include: {
        scholar: {
          select: { name: true, slug: true, isFeatured: true },
        },
        topics: {
          include: {
            topic: {
              select: { name: true, slug: true }
            }
          }
        }
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1,
    });

    const hasMore = lectures.length > limit;
    const page = hasMore ? lectures.slice(0, limit) : lectures;

    const contentItems: FeedContentItemDto[] = page.map((r) => ({
      kind: 'lecture' as const,
      id: r.id,
      title: r.title,
      slug: r.slug,
      scholarName: r.scholar.name,
      scholarSlug: r.scholar.slug,
      thumbnailUrl: null,
      durationSeconds: r.durationSeconds,
      publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
    }));

    // Build feed with mixed content and horizontal rows
    const items: FeedItemDto[] = [];
    const scholarRow = await this.getScholarRowItems();
    let scholarRowInjected = false;
    let topicRowInjected = false;

    for (let i = 0; i < contentItems.length; i++) {
      items.push(contentItems[i]);

      // Inject scholar row after 3rd item
      if (!scholarRowInjected && i === 3 && scholarRow.length > 0) {
        items.push({ kind: 'scholar_row', scholars: scholarRow });
        scholarRowInjected = true;
      }

      // Inject topic row after 7th item if we have topic suggestions
      if (!topicRowInjected && i === 7 && topicSlugs?.length) {
        const topicRow = await this.getTopicRowItems(topicSlugs[0]);
        if (topicRow) {
          items.push(topicRow);
          topicRowInjected = true;
        }
      }
    }

    const lastItem = page[page.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? (lastItem.publishedAt ?? lastItem.createdAt).toISOString()
        : undefined;

    return { items, nextCursor };
  }

  async getScholars(): Promise<ScholarChipDto[]> {
    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { isKibar: 'desc' }],
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      imageUrl: r.imageUrl,
    }));
  }

  private async getScholarRowItems(): Promise<ScholarChipDto[]> {
    const records = await this.prisma.scholar.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { isKibar: 'desc' }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      imageUrl: r.imageUrl,
    }));
  }

  private async getTopicRowItems(topicSlug: string): Promise<FeedTopicRowDto | null> {
    // Get the topic name
    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { name: true }
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
            topic: { slug: topicSlug }
          }
        }
      },
      include: {
        scholar: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 6
    });

    const items: ContentSuggestionDto[] = lectures.map(lecture => ({
      kind: 'lecture' as const,
      id: lecture.id,
      title: lecture.title,
      slug: lecture.slug,
      scholarName: lecture.scholar.name,
      scholarSlug: lecture.scholar.slug,
      thumbnailUrl: null,
      durationSeconds: lecture.durationSeconds,
    }));

    if (items.length === 0) return null;

    return {
      kind: 'topic_row' as const,
      topicName: topic.name,
      items
    };
  }
}
