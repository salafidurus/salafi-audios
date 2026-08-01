import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { ListingRepository } from './listing.repo';

describe('ListingRepository — getProgressSummary', () => {
  let repo: ListingRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      listing: {
        findFirst: vi.fn<any>(),
      },
      userListingProgress: {
        findUnique: vi.fn<any>(),
      },
      $queryRaw: vi.fn<any>(),
    };

    repo = new ListingRepository(prisma);
  });

  it('returns null when the listing cannot be found', async () => {
    prisma.listing.findFirst.mockResolvedValue(null);

    const result = await repo.getProgressSummary('missing', 'user1');

    expect(result).toBeNull();
  });

  describe('format: single', () => {
    it('reports 1/1 completed when the single has a completed progress row', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'single-1', format: 'single' });
      prisma.userListingProgress.findUnique.mockResolvedValue({ isCompleted: true });

      const result = await repo.getProgressSummary('single-1', 'user1');

      expect(result).toEqual({
        listingId: 'single-1',
        format: 'single',
        totalCount: 1,
        completedCount: 1,
        percentComplete: 100,
        isCompleted: true,
      });
      expect(prisma.userListingProgress.findUnique).toHaveBeenCalledWith({
        where: { userId_listingId: { userId: 'user1', listingId: 'single-1' } },
        select: { isCompleted: true },
      });
    });

    it('reports 0/1 completed when there is no progress row yet', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'single-1', format: 'single' });
      prisma.userListingProgress.findUnique.mockResolvedValue(null);

      const result = await repo.getProgressSummary('single-1', 'user1');

      expect(result).toEqual({
        listingId: 'single-1',
        format: 'single',
        totalCount: 1,
        completedCount: 0,
        percentComplete: 0,
        isCompleted: false,
      });
    });
  });

  describe('format: series', () => {
    it('aggregates completed/total across the series direct children', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'series-1', format: 'series' });
      prisma.$queryRaw.mockResolvedValue([{ total: 5, completed: 2 }]);

      const result = await repo.getProgressSummary('series-1', 'user1');

      expect(result).toEqual({
        listingId: 'series-1',
        format: 'series',
        totalCount: 5,
        completedCount: 2,
        percentComplete: 40,
        isCompleted: false,
      });
    });

    it('marks isCompleted true only when completedCount equals a nonzero totalCount', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'series-1', format: 'series' });
      prisma.$queryRaw.mockResolvedValue([{ total: 3, completed: 3 }]);

      const result = await repo.getProgressSummary('series-1', 'user1');

      expect(result?.isCompleted).toBe(true);
    });

    it('reports 0 percent and not completed when the series has no published lessons yet', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'series-1', format: 'series' });
      prisma.$queryRaw.mockResolvedValue([{ total: 0, completed: 0 }]);

      const result = await repo.getProgressSummary('series-1', 'user1');

      expect(result).toEqual({
        listingId: 'series-1',
        format: 'series',
        totalCount: 0,
        completedCount: 0,
        percentComplete: 0,
        isCompleted: false,
      });
    });
  });

  describe('format: collection', () => {
    it('aggregates completed/total across all lessons in all modules (2-level join)', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'collection-1', format: 'collection' });
      prisma.$queryRaw.mockResolvedValue([{ total: 20, completed: 12 }]);

      const result = await repo.getProgressSummary('collection-1', 'user1');

      expect(result).toEqual({
        listingId: 'collection-1',
        format: 'collection',
        totalCount: 20,
        completedCount: 12,
        percentComplete: 60,
        isCompleted: false,
      });
    });
  });
});
