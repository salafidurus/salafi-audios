/** Explore data adapter that hydrates internal recommendation references into the public presentation model. */
/* oxlint-disable anti-slop/require-tsdoc -- Internal hydration projections are owned by Explore. */
import { Injectable } from '@nestjs/common';
import { Status, TranslationStatus } from '@sd/core-db';
import type { ListingFormat, Locale, ScholarTitle } from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { ConfigService } from '../../core/config/config.service';
import { PrimaryDbService } from '../../core/db/primary-db.service';
import type {
  ExploreRecommendationBatch,
  ExploreRecommendationResult,
} from '../recommendation/explore-recommendation.repo';

export type ExploreListingItem = {
  kind: ListingFormat;
  id: string;
  title: string;
  slug: string;
  scholarName: string;
  scholarSlug: string;
  scholarTitle?: ScholarTitle;
  scholarImageUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number;
  publishedLectureCount: number;
  publishedAt: string;
  originalLanguage?: Locale;
  original?: { title?: string };
};
export type ExploreScholarItem = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  mainLanguage?: Locale;
  originalLanguage?: Locale;
  original?: { name?: string };
  title?: ScholarTitle;
  lectureCount: number;
};
export type ExploreTopicItem = { id: string; slug: string; name: string };
export type ExploreBatch =
  | (Extract<ExploreRecommendationBatch, { kind: 'listings' }> & { items: ExploreListingItem[] })
  | (Extract<ExploreRecommendationBatch, { kind: 'scholars' }> & { items: ExploreScholarItem[] })
  | (Extract<ExploreRecommendationBatch, { kind: 'topics' }> & { items: ExploreTopicItem[] });
export type ExplorePage = Omit<ExploreRecommendationResult, 'batches'> & {
  batches: ExploreBatch[];
};

type ListingRecord = {
  id: string;
  slug: string;
  format: ListingFormat;
  title: string;
  language: Locale | null;
  durationSeconds: number | null;
  publishedDurationSeconds: number | null;
  coverImageUrl: string | null;
  publishedLectureCount: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  translations: Array<{ title: string }>;
  scholar: {
    name: string;
    slug: string;
    title: ScholarTitle | null;
    imageUrl: string | null;
    mainLanguage: Locale;
    translations: Array<{ name: string }>;
  };
};

// oxlint-disable-next-line complexity -- Presentation mapping intentionally centralizes the format-specific public projection.
function listingItem(
  record: ListingRecord,
  locale: Locale,
  toPublicUrl: (value: string) => string | undefined,
): ExploreListingItem {
  const resolved = resolveContentTranslation({
    base: { title: record.title },
    originalLanguage: record.language,
    targetLocale: locale,
    publishedTranslation: record.translations[0] ?? null,
  });
  const scholarName = resolveContentTranslation({
    base: { name: record.scholar.name },
    originalLanguage: record.scholar.mainLanguage,
    targetLocale: locale,
    publishedTranslation: record.scholar.translations[0] ?? null,
  }).fields.name;
  const durationSeconds =
    record.format === 'single'
      ? (record.durationSeconds ?? 0)
      : (record.publishedDurationSeconds ?? 0);
  const thumbnailUrl = record.format === 'single' ? null : toPublicUrl(record.coverImageUrl ?? '');
  return {
    kind: record.format,
    id: record.id,
    title: resolved.fields.title,
    slug: record.slug,
    scholarName,
    scholarSlug: record.scholar.slug,
    scholarTitle: record.scholar.title ?? undefined,
    scholarImageUrl: record.scholar.imageUrl,
    thumbnailUrl: thumbnailUrl ?? null,
    durationSeconds,
    publishedLectureCount: record.format === 'single' ? 1 : (record.publishedLectureCount ?? 1),
    publishedAt: (record.publishedAt ?? record.createdAt).toISOString(),
    originalLanguage: resolved.originalLanguage,
    original: resolved.original ? { title: resolved.original.title ?? undefined } : undefined,
  };
}

@Injectable()
export class ExploreRepo {
  constructor(
    private readonly prisma: PrimaryDbService,
    private readonly config: ConfigService,
  ) {}

  async hydrate(page: ExploreRecommendationResult, locale: Locale): Promise<ExplorePage> {
    const batches = await Promise.all(
      page.batches.map((batch) => this.hydrateBatch(batch, locale)),
    );
    return {
      ...page,
      batches: batches.filter((batch): batch is ExploreBatch => batch.items.length > 0),
    };
  }

  private async hydrateBatch(
    batch: ExploreRecommendationBatch,
    locale: Locale,
  ): Promise<ExploreBatch> {
    if (batch.kind === 'listings') {
      const rows = await this.prisma.listing.findMany({
        where: { id: { in: batch.itemIds } },
        include: {
          translations: {
            where: { locale, status: TranslationStatus.published },
            select: { title: true },
            take: 1,
          },
          scholar: {
            select: {
              name: true,
              slug: true,
              title: true,
              imageUrl: true,
              mainLanguage: true,
              translations: {
                where: { locale, status: TranslationStatus.published },
                select: { name: true },
                take: 1,
              },
            },
          },
        },
      });
      // SAFETY: the select/include shape above is the ListingRecord projection used by listingItem.
      const typedRows = rows as ListingRecord[];
      const byId = new Map(typedRows.map((row) => [row.id, row]));
      return {
        ...batch,
        items: batch.itemIds.flatMap((id) => {
          const row = byId.get(id);
          return row ? [listingItem(row, locale, (value) => this.toOptionalPublicUrl(value))] : [];
        }),
      };
    }
    if (batch.kind === 'scholars') {
      const rows = await this.prisma.scholar.findMany({
        where: { id: { in: batch.itemIds } },
        select: {
          id: true,
          slug: true,
          name: true,
          imageUrl: true,
          mainLanguage: true,
          title: true,
          translations: {
            where: { locale, status: TranslationStatus.published },
            select: { name: true },
            take: 1,
          },
          _count: {
            select: {
              listings: { where: { format: 'single', status: Status.published, deletedAt: null } },
            },
          },
        },
      });
      const byId = new Map(rows.map((row) => [row.id, row]));
      return {
        ...batch,
        items: batch.itemIds.flatMap((id) => {
          const row = byId.get(id);
          if (!row) return [];
          const resolved = resolveContentTranslation({
            base: { name: row.name },
            originalLanguage: row.mainLanguage,
            targetLocale: locale,
            publishedTranslation: row.translations[0] ?? null,
          });
          return [
            {
              id: row.id,
              slug: row.slug,
              name: resolved.fields.name,
              imageUrl: row.imageUrl ?? undefined,
              mainLanguage: row.mainLanguage ?? undefined,
              originalLanguage: resolved.originalLanguage,
              original: resolved.original ? { name: resolved.original.name } : undefined,
              title: row.title ?? undefined,
              lectureCount: row._count.listings,
            },
          ];
        }),
      };
    }
    const rows = await this.prisma.topic.findMany({
      where: { id: { in: batch.itemIds } },
      select: {
        id: true,
        slug: true,
        name: true,
        translations: { where: { locale }, select: { name: true }, take: 1 },
      },
    });
    const byId = new Map(rows.map((row) => [row.id, row]));
    return {
      ...batch,
      items: batch.itemIds.flatMap((id) => {
        const row = byId.get(id);
        return row
          ? [{ id: row.id, slug: row.slug, name: row.translations[0]?.name ?? row.name }]
          : [];
      }),
    };
  }

  private toOptionalPublicUrl(value?: string | null): string | undefined {
    if (!value) return undefined;
    if (/^[a-z]+:\/\//i.test(value)) return value;
    const base = this.config.ASSET_CDN_BASE_URL;
    return base ? `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}` : value;
  }
}
