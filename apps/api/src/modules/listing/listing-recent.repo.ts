import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/db/prisma.service';
import { Status } from '@sd/core-db';
import type { FeedContentItemDto, FeedPageDto, Locale } from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { ConfigService } from '../../core/config/config.service';

@Injectable()
export class RecentListingsRepo {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getRecentListings(cursor?: string, limit = 20): Promise<FeedPageDto> {
    const locale = getRequestLocale();
    const cursorDate = cursor ? new Date(cursor) : undefined;

    const listings = await this.prisma.listing.findMany({
      where: {
        format: { in: ['single', 'series', 'collection'] },
        status: Status.published,
        deletedAt: null,
        parentId: null,
        scholar: { isActive: true },
        ...(cursorDate && { createdAt: { lt: cursorDate } }),
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
      orderBy: [{ createdAt: 'desc' }],
      take: limit + 1,
    });

    const hasMore = listings.length > limit;
    const page = hasMore ? listings.slice(0, limit) : listings;

    const items: FeedContentItemDto[] = page.map((r) => {
      const resolved = resolveContentTranslation({
        base: { title: r.title },
        originalLanguage: r.language,
        targetLocale: locale,
        publishedTranslation: r.translations[0] ?? null,
      });
      const scholarName = resolveContentTranslation({
        base: { name: r.scholar!.name },
        originalLanguage: r.scholar!.mainLanguage,
        targetLocale: locale,
        publishedTranslation: r.scholar!.translations[0] ?? null,
      }).fields.name;

      const durationSeconds =
        r.format === 'single' ? (r.durationSeconds ?? 0) : (r.publishedDurationSeconds ?? 0);
      const thumbnailUrl = r.format === 'single' ? null : this.toOptionalPublicUrl(r.coverImageUrl);

      return {
        kind: r.format as 'collection' | 'series' | 'single',
        id: r.id,
        title: resolved.fields.title,
        slug: r.slug,
        scholarName,
        scholarSlug: r.scholar!.slug,
        thumbnailUrl: thumbnailUrl ?? null,
        durationSeconds: durationSeconds ?? 0,
        publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    });

    const lastItem = page[page.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.createdAt.toISOString() : undefined;

    return { items, nextCursor };
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
