import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { Status } from '@sd/core-db';
import type {
  FeedContentItemDto,
  FeedItemDto,
  FeedPageDto,
  ScholarChipDto,
} from '@sd/core-contracts';

@Injectable()
export class FeedRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(
    cursor?: string,
    limit = 20,
    _topicSlugs?: string[],
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
    };

    // Fetch one extra to determine if there's a next page
    const lectures = await this.prisma.lecture.findMany({
      where,
      include: {
        scholar: {
          select: { name: true, slug: true, isFeatured: true },
        },
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

    // Inject scholar_row items every 4–5 content items
    const items: FeedItemDto[] = [];
    const scholarRow = await this.getScholarRowItems();
    let scholarRowInjected = false;

    for (let i = 0; i < contentItems.length; i++) {
      items.push(contentItems[i]);

      if (!scholarRowInjected && i === 3 && scholarRow.length > 0) {
        items.push({ kind: 'scholar_row', scholars: scholarRow });
        scholarRowInjected = true;
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
}
