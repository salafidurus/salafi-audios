import { Injectable } from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import type { Locale, LibraryItemDto, RecentProgressDto } from '@sd/core-contracts';
import { PrismaService } from '../../core/db/prisma.service';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

const DEFAULT_PAGE_SIZE = 20;

const listingRelationSelect = (locale: Locale) =>
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
    parent: {
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
  }) satisfies Prisma.ListingSelect;

type ListingRelation = {
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
  parent: {
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

    const records = await this.prisma.userListingProgress.findMany({
      where: {
        userId,
        isCompleted: false,
        positionSeconds: { gt: 0 },
      },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_listingId: { userId, listingId: cursor } },
            skip: 1,
          }
        : {}),
      include: { listing: { select: listingRelationSelect(locale) } },
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.progressToDto(r, locale),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.listingId : undefined;

    return { items, nextCursor };
  }

  async findCompleted(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;
    const locale = getRequestLocale();

    const records = await this.prisma.userListingProgress.findMany({
      where: { userId, isCompleted: true },
      orderBy: { updatedAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_listingId: { userId, listingId: cursor } },
            skip: 1,
          }
        : {}),
      include: { listing: { select: listingRelationSelect(locale) } },
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.progressToDto(r, locale),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.listingId : undefined;

    return { items, nextCursor };
  }

  async findSaved(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_SIZE,
  ): Promise<{ items: LibraryItemDto[]; nextCursor?: string }> {
    const take = limit + 1;
    const locale = getRequestLocale();

    const records = await this.prisma.favoriteListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor
        ? {
            cursor: { userId_listingId: { userId, listingId: cursor } },
            skip: 1,
          }
        : {}),
      include: { listing: { select: listingRelationSelect(locale) } },
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map((r) =>
      this.favoriteToDto(r, locale),
    );
    const nextCursor = hasMore ? items[items.length - 1]?.listingId : undefined;

    return { items, nextCursor };
  }

  async saveLecture(userId: string, listingId: string): Promise<void> {
    await this.prisma.favoriteListing.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {},
    });
  }

  async unsaveLecture(userId: string, listingId: string): Promise<void> {
    await this.prisma.favoriteListing.deleteMany({
      where: { userId, listingId },
    });
  }

  async bulkSave(userId: string, listingIds: string[]): Promise<void> {
    if (listingIds.length === 0) return;

    const operations = listingIds.map((listingId) =>
      this.prisma.favoriteListing.upsert({
        where: { userId_listingId: { userId, listingId } },
        create: { userId, listingId },
        update: {},
      }),
    );
    await this.prisma.$transaction(operations);
  }

  async getRecentProgress(userId: string): Promise<RecentProgressDto | null> {
    const locale = getRequestLocale();
    const record = await this.prisma.userListingProgress.findFirst({
      where: {
        userId,
        isCompleted: false,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: {
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

    const listingTitle = resolveContentTranslation({
      base: { title: record.listing.title },
      originalLanguage: record.listing.language,
      targetLocale: locale,
      publishedTranslation: record.listing.translations[0] ?? null,
    }).fields.title;
    const scholarName = resolveContentTranslation({
      base: { name: record.listing.scholar.name },
      originalLanguage: record.listing.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: record.listing.scholar.translations[0] ?? null,
    }).fields.name;

    return {
      lectureId: record.listing.id,
      lectureTitle: listingTitle,
      lectureSlug: record.listing.slug,
      scholarName,
      durationSeconds: record.listing.durationSeconds ?? 0,
      positionSeconds: record.positionSeconds,
    };
  }

  /** Shared resolution of the translatable listing relation shared by the
   * progress- and favorite-backed library item shapes. */
  private resolveListingRelation(
    listing: ListingRelation,
    locale: Locale,
  ): Pick<
    LibraryItemDto,
    | 'listingTitle'
    | 'listingSlug'
    | 'scholarId'
    | 'scholarSlug'
    | 'scholarName'
    | 'seriesTitle'
    | 'durationSeconds'
    | 'originalLanguage'
    | 'originalListingTitle'
  > {
    const resolved = resolveContentTranslation({
      base: { title: listing.title },
      originalLanguage: listing.language,
      targetLocale: locale,
      publishedTranslation: listing.translations[0] ?? null,
    });
    const scholarName = resolveContentTranslation({
      base: { name: listing.scholar.name },
      originalLanguage: listing.scholar.mainLanguage,
      targetLocale: locale,
      publishedTranslation: listing.scholar.translations[0] ?? null,
    }).fields.name;
    const seriesTitle = listing.parent
      ? resolveContentTranslation({
          base: { title: listing.parent.title },
          originalLanguage: listing.parent.language,
          targetLocale: locale,
          publishedTranslation: listing.parent.translations[0] ?? null,
        }).fields.title
      : undefined;

    return {
      listingTitle: resolved.fields.title,
      listingSlug: listing.slug,
      scholarId: listing.scholar.id,
      scholarSlug: listing.scholar.slug,
      scholarName,
      seriesTitle,
      durationSeconds: listing.durationSeconds ?? undefined,
      originalLanguage: resolved.originalLanguage,
      originalListingTitle: resolved.original?.title,
    };
  }

  private progressToDto(
    r: Prisma.UserListingProgressGetPayload<{
      include: {
        listing: { select: ReturnType<typeof listingRelationSelect> };
      };
    }>,
    locale: Locale,
  ): LibraryItemDto {
    return {
      id: `${r.userId}-${r.listingId}`,
      listingId: r.listingId,
      ...this.resolveListingRelation(r.listing, locale),
      progressSeconds: r.positionSeconds,
      completedAt: r.isCompleted ? r.updatedAt.toISOString() : undefined,
    };
  }

  private favoriteToDto(
    r: Prisma.FavoriteListingGetPayload<{
      include: {
        listing: { select: ReturnType<typeof listingRelationSelect> };
      };
    }>,
    locale: Locale,
  ): LibraryItemDto {
    return {
      id: `${r.userId}-${r.listingId}`,
      listingId: r.listingId,
      ...this.resolveListingRelation(r.listing, locale),
      savedAt: r.createdAt.toISOString(),
    };
  }
}
