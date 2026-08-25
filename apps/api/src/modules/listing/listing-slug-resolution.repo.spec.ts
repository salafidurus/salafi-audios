import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { runWithLocale } from '../../shared/i18n/locale-context';
import { ListingRepository } from './listing.repo';

/**
 * Focused tests for the public Catalog identity seam: a Listing is resolved
 * by public slug only, only when published and not deleted. ID-shaped route
 * values are opaque strings that match no slug — they never fall back to an
 * internal-ID lookup.
 */

const UUID_SHAPED = 'a0000000-0000-0000-0000-000000000000';

const publishedSingleRow = {
  id: 'single-internal-id',
  slug: 'known-single',
  title: 'Original Title',
  description: 'Original description',
  format: 'single',
  language: 'en',
  durationSeconds: 600,
  publishedAt: new Date('2026-01-01T00:00:00Z'),
  parentId: null as string | null,
  translations: [] as { title: string; description?: string | null }[],
  scholar: {
    id: 'sch-1',
    slug: 'scholar-one',
    name: 'Scholar One',
    mainLanguage: 'en',
    imageUrl: null,
    translations: [] as { name: string }[],
  },
  topics: [] as { topic: { id: string; slug: string; name: string; translations: unknown[] } }[],
  audioAssets: [] as {
    id: string;
    url: string;
    format: string;
    bitrateKbps: number;
    durationSeconds: number;
  }[],
};

describe('ListingRepository — public slug resolution seam', () => {
  let repo: ListingRepository;
  let prisma: any;

  const detailCall = (): Record<string, any> => prisma.listing.findFirst.mock.calls[0][0];

  beforeEach(() => {
    prisma = {
      listing: { findFirst: vi.fn<any>(), findMany: vi.fn<any>() },
      userListingProgress: { findUnique: vi.fn<any>() },
      $queryRaw: vi.fn<any>(),
    };
    repo = new ListingRepository(prisma);
  });

  describe('slug resolution (no internal-ID fallback)', () => {
    it('resolves detail strictly by slug equality', async () => {
      prisma.listing.findFirst.mockResolvedValueOnce({ ...publishedSingleRow });

      await repo.findDetailBySlug('known-single');

      // Detail additionally keeps its presentation gate on an active Scholar;
      // the identity rule itself is slug + publication only.
      expect(detailCall().where).toEqual({
        slug: 'known-single',
        deletedAt: null,
        status: 'published',
        scholar: { isActive: true },
      });
    });

    it('resolves contents strictly by slug equality', async () => {
      prisma.listing.findFirst.mockResolvedValueOnce({ ...publishedSingleRow });

      await repo.findContentsBySlug('known-single');

      expect(prisma.listing.findFirst.mock.calls[0][0].where).toEqual({
        slug: 'known-single',
        deletedAt: null,
        status: 'published',
        scholar: { isActive: true },
      });
    });

    it('treats an ID-shaped route value as an opaque slug with no compatibility lookup', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(repo.findDetailBySlug(UUID_SHAPED)).resolves.toBeNull();
      await expect(repo.findContentsBySlug(UUID_SHAPED)).resolves.toBeNull();

      for (const call of prisma.listing.findFirst.mock.calls) {
        expect(call[0].where.OR).toBeUndefined();
        expect(call[0].where.id).toBeUndefined();
        expect(call[0].where.slug).toBe(UUID_SHAPED);
      }
    });
  });

  describe('publication filtering', () => {
    it('excludes unpublished and archived listings from detail resolution', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(repo.findDetailBySlug('draft-lecture')).resolves.toBeNull();

      expect(detailCall().where.status).toBe('published');
      expect(detailCall().where.deletedAt).toBeNull();
    });

    it('excludes unpublished listings from last-played resolution', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(repo.findLastPlayedLesson('draft-lecture', 'user-1')).resolves.toBeNull();

      const where = prisma.listing.findFirst.mock.calls[0][0].where;
      expect(where).toEqual({ slug: 'draft-lecture', deletedAt: null, status: 'published' });
    });

    it('excludes unpublished listings from progress-summary resolution', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(repo.getProgressSummary('archived-series', 'user-1')).resolves.toBeNull();

      const where = prisma.listing.findFirst.mock.calls[0][0].where;
      expect(where).toEqual({ slug: 'archived-series', deletedAt: null, status: 'published' });
    });

    it('returns the resolved public slug in progress-summary responses', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'series-internal-id',
        slug: 'known-series',
        format: 'series',
      });
      prisma.$queryRaw.mockResolvedValue([{ total: 2, completed: 1 }]);

      await expect(repo.getProgressSummary('known-series', 'user-1')).resolves.toMatchObject({
        listingId: 'series-internal-id',
        listingSlug: 'known-series',
      });
    });

    it('does not resolve related items off an unpublished target listing', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(repo.findRelated('draft-lecture')).resolves.toEqual([]);

      const where = prisma.listing.findFirst.mock.calls[0][0].where;
      expect(where).toEqual({ slug: 'draft-lecture', deletedAt: null, status: 'published' });
    });
  });

  describe('locale fallback', () => {
    it('applies a published translation in the request locale and exposes the original block', async () => {
      prisma.listing.findFirst.mockResolvedValueOnce({
        ...publishedSingleRow,
        translations: [{ title: 'عنوان مترجم', description: null }],
      });

      const result = await runWithLocale('ar', () => repo.findDetailBySlug('known-single'));

      // The approved presentation query targets the request locale.
      expect(prisma.listing.findFirst.mock.calls[0][0].select.translations.where).toEqual({
        locale: 'ar',
        status: 'published',
      });
      expect(result?.title).toBe('عنوان مترجم');
      expect(result?.originalLanguage).toBe('en');
      expect(result?.original?.title).toBe('Original Title');
      // Fields the translation omits fall back to the base content.
      expect(result?.description).toBe('Original description');
    });

    it('falls back to base fields when no published translation exists in the locale', async () => {
      prisma.listing.findFirst.mockResolvedValueOnce({ ...publishedSingleRow });

      const result = await runWithLocale('ar', () => repo.findDetailBySlug('known-single'));

      expect(result?.title).toBe('Original Title');
      expect(result?.originalLanguage).toBe('en');
      expect(result?.original).toBeUndefined();
    });
  });

  describe('projection completeness', () => {
    it('projects scholar, topics, ancestry, and playable content in one payload', async () => {
      prisma.listing.findFirst
        .mockResolvedValueOnce({
          ...publishedSingleRow,
          parentId: 'series-internal-id',
          audioAssets: [
            {
              id: 'asset-1',
              url: 'https://cdn.example.test/audio/lesson.mp3',
              format: 'mp3',
              bitrateKbps: 128,
              durationSeconds: 600,
            },
          ],
          scholar: {
            ...publishedSingleRow.scholar,
            imageUrl: 'https://cdn.example.test/scholar.png',
          },
          topics: [
            {
              topic: {
                id: 'topic-1',
                slug: 'aqidah',
                name: 'Aqidah',
                translations: [],
              },
            },
          ],
        })
        .mockResolvedValueOnce({
          id: 'series-internal-id',
          slug: 'series-one',
          title: 'Series One',
          language: 'en',
          parentId: null,
          translations: [],
        });

      const result = await repo.findDetailBySlug('known-single');

      expect(result).toMatchObject({
        id: 'single-internal-id',
        slug: 'known-single',
        title: 'Original Title',
        format: 'single',
        durationSeconds: 600,
        publishedAt: '2026-01-01T00:00:00.000Z',
        primaryAudioAsset: {
          id: 'asset-1',
          url: 'https://cdn.example.test/audio/lesson.mp3',
          format: 'mp3',
          bitrateKbps: 128,
          durationSeconds: 600,
        },
        scholar: {
          id: 'sch-1',
          slug: 'scholar-one',
          name: 'Scholar One',
          imageUrl: 'https://cdn.example.test/scholar.png',
        },
        topics: [{ id: 'topic-1', slug: 'aqidah', name: 'Aqidah' }],
        seriesContext: {
          seriesId: 'series-internal-id',
          seriesTitle: 'Series One',
          seriesSlug: 'series-one',
        },
        rootListing: { id: 'series-internal-id', slug: 'series-one', title: 'Series One' },
      });
    });
  });
});
