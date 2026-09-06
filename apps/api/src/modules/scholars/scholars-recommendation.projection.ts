/** Scholars adapter that hydrates recommendation references into public feed batches. */
/* oxlint-disable anti-slop/require-tsdoc -- Projection-local records are documented at the semantic fields that cross the hydration boundary. */
import { Injectable } from '@nestjs/common';
import type {
  Locale,
  ScholarContentItemDto,
  ScholarListItemDto,
  ScholarPageFeedDto,
  ScholarTitle,
} from '@sd/core-contracts';
import { resolveContentTranslation } from '../../shared/i18n/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';
import { PrimaryDbService } from '../../core/db/primary-db.service';
import type { ScholarsRecommendation } from '../recommendation/scholars-recommendation.repo';
import { publishedTopLevelCatalogListingWhere } from '../recommendation/catalog-eligibility';

type ScholarListRecord = {
  id: string;
  /** Stable public scholar identity preserved in the hydrated batch. */
  slug: string;
  name: string;
  imageUrl: string | null;
  /** Original language used when resolving the request-locale presentation. */
  mainLanguage: Locale | null;
  title: ScholarTitle | null;
  translations: Array<{ name: string }>;
  _count: { listings: number };
};

function scholarListSelect(locale: Locale) {
  return {
    id: true,
    slug: true,
    name: true,
    imageUrl: true,
    mainLanguage: true,
    title: true,
    translations: {
      where: { locale, status: 'published' },
      select: { name: true },
      take: 1,
    },
    _count: {
      select: {
        listings: {
          where: {
            format: 'single',
            ...publishedTopLevelCatalogListingWhere(),
          },
        },
      },
    },
  } as const;
}

function mapScholarListItem(record: ScholarListRecord, locale: Locale): ScholarListItemDto {
  const resolved = resolveContentTranslation({
    base: { name: record.name },
    originalLanguage: record.mainLanguage,
    targetLocale: locale,
    publishedTranslation: record.translations[0] ?? null,
  });
  return {
    id: record.id,
    slug: record.slug,
    name: resolved.fields.name,
    imageUrl: record.imageUrl ?? undefined,
    mainLanguage: record.mainLanguage ?? undefined,
    originalLanguage: resolved.originalLanguage,
    original: resolved.original ? { name: resolved.original.name } : undefined,
    title: record.title ?? undefined,
    lectureCount: record._count.listings,
  };
}

function getListingStats(listing: {
  format: string;
  publishedLectureCount: number | null;
  /** Published aggregate duration used for multi-lecture listings. */
  publishedDurationSeconds: number | null;
  /** Stored duration used for single-lecture listings. */
  durationSeconds: number | null;
}) {
  const isSingle = listing.format === 'single';
  return {
    lectureCount: isSingle ? 1 : (listing.publishedLectureCount ?? 0),
    durationSeconds: isSingle
      ? (listing.durationSeconds ?? undefined)
      : (listing.publishedDurationSeconds ?? undefined),
  };
}

@Injectable()
/**
 * Hydrates ordered Scholars recommendation references into the public feed.
 *
 * Recommendation selection and continuation remain outside this provider. The
 * supplied reference order is replayed after hydration; stale or ineligible
 * records are omitted, and empty semantic batches are not returned.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the class-level responsibility is documented above.
export class ScholarsRecommendationProjection {
  constructor(private readonly prisma: PrimaryDbService) {}

  /** Returns locale-aware public batches without changing recommendation metadata. */
  // oxlint-disable-next-line complexity -- One hydration pass preserves the ordered batch contract across three semantic forms.
  async project(recommendations: ScholarsRecommendation[]): Promise<ScholarPageFeedDto> {
    const locale = getRequestLocale();
    const scholarRecommendations = recommendations.filter(
      (item): item is Extract<ScholarsRecommendation, { form: 'scholars' }> =>
        item.form === 'scholars',
    );
    const listingRecommendations = recommendations.filter(
      (item): item is Extract<ScholarsRecommendation, { form: 'scholar_listings' }> =>
        item.form === 'scholar_listings',
    );
    const topicRecommendations = recommendations.filter(
      (item): item is Extract<ScholarsRecommendation, { form: 'topic_scholars' }> =>
        item.form === 'topic_scholars',
    );
    const scholarIds = [
      ...new Set([
        ...scholarRecommendations.flatMap((item) => item.itemIds),
        ...listingRecommendations.map((item) => item.scholarId),
        ...topicRecommendations.flatMap((item) => item.itemIds),
      ]),
    ];
    const listingIds = [...new Set(listingRecommendations.flatMap((item) => item.itemIds))];
    const topicIds = [...new Set(topicRecommendations.map((item) => item.topicId))];
    const rows = await this.prisma.scholar.findMany({
      where: { id: { in: scholarIds }, isActive: true },
      select: scholarListSelect(locale),
    });
    // SAFETY: scholarListSelect returns exactly the fields represented by ScholarListRecord.
    const byId = new Map(rows.map((row) => [row.id, row as ScholarListRecord]));
    const topics = topicIds.length
      ? await this.prisma.topic.findMany({
          where: {
            id: { in: topicIds },
            listingTopics: {
              some: {
                listing: {
                  ...publishedTopLevelCatalogListingWhere(),
                },
              },
            },
          },
          select: {
            id: true,
            slug: true,
            name: true,
            translations: { where: { locale }, select: { name: true }, take: 1 },
            listingTopics: {
              where: {
                listing: {
                  ...publishedTopLevelCatalogListingWhere(),
                },
              },
              select: { listing: { select: { scholarId: true } } },
            },
          },
        })
      : [];
    const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
    const hydratedListings = listingIds.length
      ? await this.prisma.listing.findMany({
          where: {
            id: { in: listingIds },
            ...publishedTopLevelCatalogListingWhere(),
            format: { in: ['single', 'series', 'collection'] },
          },
          select: {
            id: true,
            scholarId: true,
            slug: true,
            title: true,
            format: true,
            language: true,
            coverImageUrl: true,
            publishedLectureCount: true,
            publishedDurationSeconds: true,
            durationSeconds: true,
            publishedAt: true,
            createdAt: true,
            translations: {
              where: { locale, status: 'published' },
              select: { title: true },
              take: 1,
            },
          },
        })
      : [];
    const listingsById = new Map(hydratedListings.map((listing) => [listing.id, listing]));
    const mapListing = (
      listing: (typeof hydratedListings)[number],
      scholarImageUrl: string | null,
    ) => {
      const resolved = resolveContentTranslation({
        base: { title: listing.title },
        originalLanguage: listing.language,
        targetLocale: locale,
        publishedTranslation: listing.translations[0] ?? null,
      });
      const { lectureCount, durationSeconds } = getListingStats(listing);
      const item: ScholarContentItemDto = {
        id: listing.id,
        slug: listing.slug,
        title: resolved.fields.title,
        type: listing.format,
        recencyAt: (listing.publishedAt ?? listing.createdAt).toISOString(),
        coverImageUrl: listing.coverImageUrl ?? undefined,
        scholarImageUrl: scholarImageUrl ?? undefined,
        lectureCount,
        durationSeconds,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
      return item;
    };

    const batches = recommendations.flatMap(
      // oxlint-disable-next-line complexity -- This mapper preserves omission and ordering rules for each supported batch form.
      (recommendation): Array<ScholarPageFeedDto['batches'][number]> => {
        if (recommendation.form === 'scholars') {
          const items = recommendation.itemIds.flatMap((id) => {
            const row = byId.get(id);
            return row ? [mapScholarListItem(row, locale)] : [];
          });
          return items.length
            ? [
                {
                  form: recommendation.form,
                  id: recommendation.id,
                  title: {
                    kind: recommendation.titleKind,
                    id: 'allamah_scholars' as const,
                    label: 'Allamah scholars',
                  },
                  items,
                },
              ]
            : [];
        }

        if (recommendation.form === 'topic_scholars') {
          const topic = topicsById.get(recommendation.topicId);
          if (!topic) return [];
          const eligibleScholarIds = new Set(
            topic.listingTopics.map((relation) => relation.listing.scholarId),
          );
          const items = recommendation.itemIds.flatMap((id) => {
            const row = byId.get(id);
            return row && eligibleScholarIds.has(id) ? [mapScholarListItem(row, locale)] : [];
          });
          return items.length
            ? [
                {
                  form: recommendation.form,
                  id: recommendation.id,
                  topicSlug: recommendation.topicSlug,
                  title: {
                    kind: recommendation.titleKind,
                    id: 'topic_scholars' as const,
                    label: `${topic.translations[0]?.name ?? topic.name} scholars`,
                  },
                  topic: {
                    id: topic.id,
                    slug: topic.slug,
                    name: topic.translations[0]?.name ?? topic.name,
                  },
                  items,
                },
              ]
            : [];
        }

        const scholar = byId.get(recommendation.scholarId);
        if (!scholar) return [];
        const scholarItem = mapScholarListItem(scholar, locale);
        const items = recommendation.itemIds.flatMap((id) => {
          const listing = listingsById.get(id);
          return listing && listing.scholarId === recommendation.scholarId
            ? [mapListing(listing, scholar.imageUrl)]
            : [];
        });
        return items.length
          ? [
              {
                form: recommendation.form,
                id: recommendation.id,
                scholarSlug: recommendation.scholarSlug,
                title: {
                  kind: recommendation.titleKind,
                  id: 'scholar_listings' as const,
                  label: `${scholarItem.name}'s listings`,
                },
                scholar: scholarItem,
                items,
              },
            ]
          : [];
      },
    );

    return { schemaVersion: 1, batches, exhausted: true };
  }
}
