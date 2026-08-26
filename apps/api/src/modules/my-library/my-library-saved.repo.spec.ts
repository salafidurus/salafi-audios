import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { MyLibraryRepository } from './my-library.repo';

describe('MyLibraryRepository — save/unsave by slug', () => {
  let repo: MyLibraryRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      listing: {
        findFirst: vi.fn<any>(),
      },
      favoriteListing: {
        upsert: vi.fn<any>().mockResolvedValue(undefined),
        updateMany: vi.fn<any>().mockResolvedValue({ count: 1 }),
        findMany: vi.fn<any>(),
      },
      $executeRaw: vi.fn<any>(),
      $transaction: vi.fn<any>().mockResolvedValue(undefined),
    };
    repo = new MyLibraryRepository(prisma, {} as any);
  });

  describe('saveLecture', () => {
    it('resolves a slug to the real listing id before upserting', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing-1' });

      const result = await repo.saveLecture('user1', 'tafsir-al-fatiha');

      expect(prisma.listing.findFirst).toHaveBeenCalledWith({
        where: { slug: 'tafsir-al-fatiha' },
        select: { id: true },
      });
      expect(prisma.favoriteListing.upsert).toHaveBeenCalledWith({
        where: { userId_listingId: { userId: 'user1', listingId: 'listing-1' } },
        create: { userId: 'user1', listingId: 'listing-1', deletedAt: null },
        update: { deletedAt: null, updatedAt: expect.any(Date) },
      });
      expect(result).toBe(true);
    });

    it('returns false and does not upsert when the slug cannot be resolved', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      const result = await repo.saveLecture('user1', 'missing-slug');

      expect(result).toBe(false);
      expect(prisma.favoriteListing.upsert).not.toHaveBeenCalled();
    });

    it('clears a prior tombstone on re-save (unsave then save again)', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing-1' });

      await repo.saveLecture('user1', 'tafsir-al-fatiha');

      const args = prisma.favoriteListing.upsert.mock.calls[0][0];
      expect(args.update.deletedAt).toBeNull();
    });
  });

  describe('unsaveLecture', () => {
    it('resolves a slug to the real listing id before soft-deleting', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing-1' });

      const result = await repo.unsaveLecture('user1', 'tafsir-al-fatiha');

      expect(prisma.favoriteListing.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user1', listingId: 'listing-1' },
        data: { deletedAt: expect.any(Date), updatedAt: expect.any(Date) },
      });
      expect(result).toBe(true);
    });

    it('returns false and does not soft-delete when the slug cannot be resolved', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      const result = await repo.unsaveLecture('user1', 'missing-slug');

      expect(result).toBe(false);
      expect(prisma.favoriteListing.updateMany).not.toHaveBeenCalled();
    });

    it('does not physically delete the row — a tombstone must remain for delta sync', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing-1' });

      await repo.unsaveLecture('user1', 'tafsir-al-fatiha');

      expect(prisma.favoriteListing.deleteMany).toBeUndefined();
    });
  });

  describe('findSavedDelta', () => {
    it('returns all rows (including tombstones) when no cursor is given', async () => {
      prisma.favoriteListing.findMany.mockResolvedValue([
        {
          listingId: 'l1',
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
          deletedAt: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        {
          listingId: 'l2',
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
          deletedAt: new Date('2026-01-03T00:00:00.000Z'),
          createdAt: new Date('2025-12-01T00:00:00.000Z'),
        },
      ]);

      const result = await repo.findSavedDelta('user1');

      expect(prisma.favoriteListing.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { updatedAt: 'desc' },
        select: { listingId: true, updatedAt: true, deletedAt: true, createdAt: true },
      });
      expect(result).toEqual([
        {
          listingId: 'l1',
          updatedAt: '2026-01-02T00:00:00.000Z',
          deletedAt: undefined,
          savedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          listingId: 'l2',
          updatedAt: '2026-01-03T00:00:00.000Z',
          deletedAt: '2026-01-03T00:00:00.000Z',
          savedAt: undefined,
        },
      ]);
    });

    it('filters by updatedAt > since when a cursor is given', async () => {
      prisma.favoriteListing.findMany.mockResolvedValue([]);
      const since = new Date('2026-01-01T00:00:00.000Z');

      await repo.findSavedDelta('user1', since);

      expect(prisma.favoriteListing.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1', updatedAt: { gt: since } },
        orderBy: { updatedAt: 'desc' },
        select: { listingId: true, updatedAt: true, deletedAt: true, createdAt: true },
      });
    });

    it('does not filter out tombstoned rows — removals must be visible to delta sync', async () => {
      prisma.favoriteListing.findMany.mockResolvedValue([
        {
          listingId: 'l1',
          updatedAt: new Date(),
          deletedAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const result = await repo.findSavedDelta('user1');

      expect(result).toHaveLength(1);
      expect(result[0]?.deletedAt).toBeDefined();
    });
  });

  describe('bulkSync', () => {
    it('does nothing for an empty batch', async () => {
      await repo.bulkSync('user1', []);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('runs one raw upsert per item inside a transaction', async () => {
      await repo.bulkSync('user1', [
        { listingId: 'l1', saved: true, updatedAt: new Date().toISOString() },
        { listingId: 'l2', saved: false, updatedAt: new Date().toISOString() },
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
    });

    it('uses a plain (non-monotonic) last-write-wins CASE — no OR-guard like progress completion', async () => {
      await repo.bulkSync('user1', [
        { listingId: 'l1', saved: false, updatedAt: new Date().toISOString() },
      ]);

      const [strings] = prisma.$executeRaw.mock.calls[0];
      const sql = strings.join('?');
      expect(sql).not.toContain('OR');
      expect(sql).toContain('"deletedAt" = CASE');
      expect(sql).toContain('"updatedAt" = CASE');
    });

    it('sets deletedAt to null for a saved:true item and to the client timestamp for saved:false', async () => {
      await repo.bulkSync('user1', [
        { listingId: 'l1', saved: true, updatedAt: '2026-01-01T00:00:00.000Z' },
      ]);
      const firstCallValues = prisma.$executeRaw.mock.calls[0].slice(1);
      expect(firstCallValues).toContain(null);

      prisma.$executeRaw.mockClear();
      await repo.bulkSync('user1', [
        { listingId: 'l2', saved: false, updatedAt: '2026-01-01T00:00:00.000Z' },
      ]);
      const secondCallValues = prisma.$executeRaw.mock.calls[0].slice(1);
      const clientTimestamp = new Date('2026-01-01T00:00:00.000Z').getTime();
      expect(
        secondCallValues.some((v: unknown) => v instanceof Date && v.getTime() === clientTimestamp),
      ).toBe(true);
    });
  });
});
