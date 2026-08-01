import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { LibraryRepository } from './library.repo';

describe('LibraryRepository — save/unsave by slug', () => {
  let repo: LibraryRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      listing: {
        findFirst: vi.fn<any>(),
      },
      favoriteListing: {
        upsert: vi.fn<any>().mockResolvedValue(undefined),
        deleteMany: vi.fn<any>().mockResolvedValue(undefined),
      },
    };
    repo = new LibraryRepository(prisma, {} as any);
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
        create: { userId: 'user1', listingId: 'listing-1' },
        update: {},
      });
      expect(result).toBe(true);
    });

    it('returns false and does not upsert when the slug cannot be resolved', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      const result = await repo.saveLecture('user1', 'missing-slug');

      expect(result).toBe(false);
      expect(prisma.favoriteListing.upsert).not.toHaveBeenCalled();
    });
  });

  describe('unsaveLecture', () => {
    it('resolves a slug to the real listing id before deleting', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing-1' });

      const result = await repo.unsaveLecture('user1', 'tafsir-al-fatiha');

      expect(prisma.favoriteListing.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user1', listingId: 'listing-1' },
      });
      expect(result).toBe(true);
    });

    it('returns false and does not delete when the slug cannot be resolved', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      const result = await repo.unsaveLecture('user1', 'missing-slug');

      expect(result).toBe(false);
      expect(prisma.favoriteListing.deleteMany).not.toHaveBeenCalled();
    });
  });
});
