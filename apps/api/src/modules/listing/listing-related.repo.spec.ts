import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { ListingRepository } from './listing.repo';

const baseListing = {
  id: 'listing-1',
  scholarId: 'sch-1',
  parentId: null as string | null,
  topics: [] as { topicId: string }[],
};

describe('ListingRepository — findRelated', () => {
  let repo: ListingRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      listing: {
        findFirst: vi.fn<any>(),
        findMany: vi.fn<any>().mockResolvedValue([]),
      },
    };
    repo = new ListingRepository(prisma);
  });

  it('resolves the listing by slug, not just uuid', async () => {
    prisma.listing.findFirst.mockResolvedValue(baseListing);

    await repo.findRelated('tafsir-al-fatiha');

    expect(prisma.listing.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ slug: 'tafsir-al-fatiha' }) }),
    );
  });

  it('resolves the listing by uuid directly', async () => {
    prisma.listing.findFirst.mockResolvedValue(baseListing);

    await repo.findRelated('3fa85f64-5717-4562-b3fc-2c963f66afa6');

    expect(prisma.listing.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
      }),
    );
  });

  it('excludes the listing itself from its own related results by resolved id, not the raw slug param', async () => {
    prisma.listing.findFirst.mockResolvedValue(baseListing);

    await repo.findRelated('tafsir-al-fatiha');

    const relatedCall = prisma.listing.findMany.mock.calls[0]![0];
    expect(relatedCall.where.AND[0]).toEqual({ id: { not: 'listing-1' } });
  });

  it('returns an empty list when the listing cannot be resolved', async () => {
    prisma.listing.findFirst.mockResolvedValue(null);

    const result = await repo.findRelated('missing-slug');

    expect(result).toEqual([]);
    expect(prisma.listing.findMany).not.toHaveBeenCalled();
  });
});
