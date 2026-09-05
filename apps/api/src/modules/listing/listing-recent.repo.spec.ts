import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { RecentListingsRepo } from './listing-recent.repo';

describe('RecentListingsRepo', () => {
  let repo: RecentListingsRepo;
  let prismaFindManySpy: any;
  let scholarFindManySpy: any;
  let topicFindManySpy: any;
  let prisma: any;
  let config: any;

  beforeEach(() => {
    prismaFindManySpy = vi.fn().mockResolvedValue([]);
    scholarFindManySpy = vi.fn().mockResolvedValue([]);
    topicFindManySpy = vi.fn().mockResolvedValue([]);

    prisma = {
      listing: {
        findMany: prismaFindManySpy,
      },
      scholar: {
        findMany: scholarFindManySpy,
      },
      topic: {
        findMany: topicFindManySpy,
        findUnique: vi.fn().mockResolvedValue({ name: 'Aqeedah', translations: [] }),
      },
    };

    config = {
      ASSET_CDN_BASE_URL: 'https://cdn.example.com',
    };

    repo = new RecentListingsRepo(prisma, config);
  });

  describe('getRecentListings', () => {
    it('returns a versioned listings batch with topic title context', async () => {
      prismaFindManySpy.mockResolvedValue([
        {
          id: 'listing-1',
          slug: 'listing-1',
          title: 'Aqeedah lesson',
          format: 'single' as const,
          language: 'ar',
          durationSeconds: 1800,
          publishedDurationSeconds: null,
          publishedLectureCount: null,
          coverImageUrl: null,
          publishedAt: new Date('2026-07-24'),
          createdAt: new Date('2026-07-24'),
          scholar: {
            name: 'Scholar',
            slug: 'scholar-1',
            imageUrl: null,
            mainLanguage: 'ar',
            translations: [],
          },
          translations: [],
        },
      ]);

      const result = await repo.getRecentListings(undefined, 20, 'aqeedah');

      expect(result.schemaVersion).toBe(1);
      expect(result.batches).toHaveLength(1);
      expect(result.batches[0]).toMatchObject({
        kind: 'listings',
        id: 'listings:topic:aqeedah',
        title: { kind: 'topic_listings', topicSlug: 'aqeedah', label: 'Aqeedah' },
        reason: 'deterministic_recent',
      });
      expect(result.batches[0]?.items[0]?.slug).toBe('listing-1');
      expect(result.nextCursor).toBeUndefined();
      expect(result.exhausted).toBe(true);
    });

    it('queries all three listing formats (single, series, collection)', async () => {
      await repo.getRecentListings();

      expect(prismaFindManySpy).toHaveBeenCalledTimes(1);
      const callArgs = prismaFindManySpy.mock.calls[0][0];

      expect(callArgs?.where?.format?.in).toContain('single');
      expect(callArgs?.where?.format?.in).toContain('series');
      expect(callArgs?.where?.format?.in).toContain('collection');
      expect(callArgs?.where?.parentId).toBe(null);
      expect(callArgs?.where?.status).toBe('published');
    });

    it('includes translations and scholar in one query (no separate roundtrips)', async () => {
      await repo.getRecentListings();

      const callArgs = prismaFindManySpy.mock.calls[0][0];

      expect(callArgs?.include?.translations).toBeDefined();
      expect(callArgs?.include?.scholar).toBeDefined();
      expect(callArgs?.include?.topics).toBeUndefined();
    });

    it('orders by createdAt DESC and applies cursor pagination', async () => {
      const cursorDate = new Date('2026-07-24T12:00:00Z').toISOString();
      await repo.getRecentListings(cursorDate, 10);

      const callArgs = prismaFindManySpy.mock.calls[0][0];

      expect(callArgs?.orderBy).toEqual([{ createdAt: 'desc' }, { slug: 'desc' }]);
      expect(callArgs?.where?.createdAt?.lt).toBeDefined();
      expect(callArgs?.take).toBe(11);
    });

    it('uses the slug tie-breaker when a structured cursor is supplied', async () => {
      const cursor = Buffer.from(
        JSON.stringify({ date: '2026-07-24T12:00:00.000Z', slug: 'listing-5' }),
      ).toString('base64url');

      await repo.getRecentListings(cursor, 10);

      const where = prismaFindManySpy.mock.calls[0][0]?.where;
      expect(where?.OR).toEqual([
        { createdAt: { lt: new Date('2026-07-24T12:00:00.000Z') } },
        { createdAt: new Date('2026-07-24T12:00:00.000Z'), slug: { lt: 'listing-5' } },
      ]);
    });

    it('maps rows with correct format-aware durationSeconds and thumbnailUrl', async () => {
      const mockListings = [
        {
          id: 'single-1',
          slug: 'single-1',
          title: 'Single Talk',
          format: 'single' as const,
          language: 'ar',
          durationSeconds: 3600,
          publishedDurationSeconds: null,
          coverImageUrl: null,
          publishedAt: new Date('2026-07-24'),
          createdAt: new Date('2026-07-24'),
          scholar: {
            name: 'Scholar Name',
            slug: 'scholar-1',
            mainLanguage: 'ar',
            translations: [],
          },
          translations: [],
        },
        {
          id: 'series-1',
          slug: 'series-1',
          title: 'Series Title',
          format: 'series' as const,
          language: 'ar',
          durationSeconds: null,
          publishedDurationSeconds: 72000,
          coverImageUrl: 'covers/series-1.jpg',
          publishedAt: new Date('2026-07-23'),
          createdAt: new Date('2026-07-23'),
          scholar: {
            name: 'Scholar Name 2',
            slug: 'scholar-2',
            mainLanguage: 'ar',
            translations: [],
          },
          translations: [],
        },
      ];

      prismaFindManySpy.mockResolvedValue(mockListings);

      const result = await repo.getRecentListings(undefined, 20);

      const contentItems = result.batches[0]?.items ?? [];
      expect(contentItems).toHaveLength(2);
      const item0 = contentItems[0] as any;
      expect(item0?.kind).toBe('single');
      expect(item0?.durationSeconds).toBe(3600);
      expect(item0?.thumbnailUrl).toBe(null);

      const item1 = contentItems[1] as any;
      expect(item1?.kind).toBe('series');
      expect(item1?.durationSeconds).toBe(72000);
      expect(item1?.thumbnailUrl).toBeTruthy();
    });

    it('returns nextCursor when hasMore is true', async () => {
      const mockListings = Array(21)
        .fill(null)
        .map((_, i) => ({
          id: `listing-${i}`,
          slug: `listing-${i}`,
          title: `Listing ${i}`,
          format: 'single' as const,
          language: 'ar',
          durationSeconds: 3600,
          publishedDurationSeconds: null,
          coverImageUrl: null,
          publishedAt: new Date(`2026-07-${24 - Math.floor(i / 10)}`),
          createdAt: new Date(`2026-07-${24 - Math.floor(i / 10)}`),
          scholar: {
            name: 'Scholar',
            slug: 'scholar-1',
            mainLanguage: 'ar',
            translations: [],
          },
          translations: [],
        }));

      prismaFindManySpy.mockResolvedValue(mockListings);

      const result = await repo.getRecentListings(undefined, 20);

      expect(result.batches[0]?.items).toHaveLength(20);
      expect(result.nextCursor).toBeDefined();
    });

    it('returns undefined nextCursor when no more items', async () => {
      const mockListings = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `listing-${i}`,
          slug: `listing-${i}`,
          title: `Listing ${i}`,
          format: 'single' as const,
          language: 'ar',
          durationSeconds: 3600,
          publishedDurationSeconds: null,
          coverImageUrl: null,
          publishedAt: new Date('2026-07-24'),
          createdAt: new Date('2026-07-24'),
          scholar: {
            name: 'Scholar',
            slug: 'scholar-1',
            mainLanguage: 'ar',
            translations: [],
          },
          translations: [],
        }));

      prismaFindManySpy.mockResolvedValue(mockListings);

      const result = await repo.getRecentListings(undefined, 20);

      expect(result.batches[0]?.items).toHaveLength(10);
      expect(result.nextCursor).toBeUndefined();
      expect(result.exhausted).toBe(true);
    });

    it('returns an ordered senior scholars batch for the initial page', async () => {
      scholarFindManySpy.mockResolvedValue([
        {
          id: 'scholar-1',
          slug: 'scholar-1',
          name: 'Scholar One',
          imageUrl: 'scholars/one.jpg',
          mainLanguage: 'ar',
          title: 'allamah',
          translations: [{ name: 'العالم الأول' }],
          _count: { listings: 12 },
        },
        {
          id: 'scholar-2',
          slug: 'scholar-2',
          name: 'Scholar Two',
          imageUrl: null,
          mainLanguage: 'ar',
          title: 'allamah',
          translations: [],
          _count: { listings: 3 },
        },
      ]);

      const result = await repo.getRecentListings();

      expect(result.batches.map((batch) => batch.kind)).toEqual(['scholars']);
      expect(result.batches[0]).toMatchObject({
        id: 'scholars:senior',
        title: { kind: 'scholars', id: 'senior_scholars', label: 'Senior Scholars' },
        reason: 'deterministic_senior_scholars',
      });
      expect(result.batches[0]?.items.map((item) => item.slug)).toEqual(['scholar-1', 'scholar-2']);
      expect(scholarFindManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { title: 'allamah', isActive: true },
          orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
        }),
      );
    });

    it('omits the scholar batch when no eligible scholars exist', async () => {
      const result = await repo.getRecentListings();

      expect(result.batches).toEqual([]);
    });

    it('returns localized eligible topics in deterministic order on the initial page', async () => {
      topicFindManySpy.mockResolvedValue([
        {
          id: 'topic-1',
          slug: 'aqeedah',
          name: 'العقيدة',
          translations: [{ name: 'Aqeedah' }],
        },
        {
          id: 'topic-2',
          slug: 'fiqh',
          name: 'الفقه',
          translations: [],
        },
      ]);

      const result = await repo.getRecentListings();

      expect(result.batches).toMatchObject([
        {
          kind: 'topics',
          id: 'topics:discoverable',
          title: { kind: 'topics', id: 'discoverable_topics', label: 'Explore topics' },
          reason: 'deterministic_topics',
          items: [
            { id: 'topic-1', slug: 'aqeedah', name: 'Aqeedah' },
            { id: 'topic-2', slug: 'fiqh', name: 'الفقه' },
          ],
        },
      ]);
      expect(topicFindManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            listingTopics: {
              some: {
                listing: expect.objectContaining({
                  format: { in: ['single', 'series', 'collection'] },
                  status: 'published',
                  deletedAt: null,
                  parentId: null,
                  scholar: { isActive: true },
                }),
              },
            },
          },
          orderBy: [{ orderIndex: 'asc' }, { slug: 'asc' }],
        }),
      );
    });

    it('omits the topic batch when no usable topics exist', async () => {
      const result = await repo.getRecentListings();

      expect(result.batches).toEqual([]);
    });
  });
});
