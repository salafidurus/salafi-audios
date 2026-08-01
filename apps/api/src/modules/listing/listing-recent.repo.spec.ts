import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { RecentListingsRepo } from './listing-recent.repo';

describe('RecentListingsRepo', () => {
  let repo: RecentListingsRepo;
  let prismaFindManySpy: any;
  let prisma: any;
  let config: any;

  beforeEach(() => {
    prismaFindManySpy = vi.fn().mockResolvedValue([]);

    prisma = {
      listing: {
        findMany: prismaFindManySpy,
      },
    };

    config = {
      ASSET_CDN_BASE_URL: 'https://cdn.example.com',
    };

    repo = new RecentListingsRepo(prisma, config);

    vi.mock('../../shared/i18n/locale-context', () => ({
      getRequestLocale: () => 'en',
    }));
  });

  describe('getRecentListings', () => {
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

      expect(callArgs?.orderBy).toEqual([{ createdAt: 'desc' }]);
      expect(callArgs?.where?.createdAt?.lt).toBeDefined();
      expect(callArgs?.take).toBe(11);
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

      const result = await repo.getRecentListings();

      expect(result.items).toHaveLength(2);
      const item0 = result.items[0] as any;
      expect(item0?.kind).toBe('single');
      expect(item0?.durationSeconds).toBe(3600);
      expect(item0?.thumbnailUrl).toBe(null);

      const item1 = result.items[1] as any;
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

      expect(result.items).toHaveLength(20);
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

      expect(result.items).toHaveLength(10);
      expect(result.nextCursor).toBeUndefined();
    });
  });
});
