import { beforeEach, describe, expect, it, vi } from 'bun:test';
import { BadRequestException } from '@nestjs/common';
import { ListingRepository } from './listing.repo';

describe('ListingRepository — editorial status transitions', () => {
  let repo: ListingRepository;
  let prisma: {
    listing: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prisma = {
      listing: { findUnique: vi.fn(), update: vi.fn() },
      $transaction: vi.fn(async (callback: (tx: typeof prisma) => unknown) => callback(prisma)),
    };
    repo = new ListingRepository(prisma as never);
  });

  it('publishes a review listing and records the editor', async () => {
    prisma.listing.findUnique.mockResolvedValue({
      parentId: null,
      status: 'review',
      deletedAt: null,
    });
    await repo.transitionListingStatus('listing-1', 'publish', 'editor-1');
    expect(prisma.listing.update).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
      data: expect.objectContaining({
        status: 'published',
        updatedBy: 'editor-1',
        publishedAt: expect.any(Date),
      }),
    });
  });

  it('rejects an invalid transition before updating durable state', async () => {
    prisma.listing.findUnique.mockResolvedValue({
      parentId: null,
      status: 'archived',
      deletedAt: null,
    });
    await expect(repo.transitionListingStatus('listing-1', 'publish')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.listing.update).not.toHaveBeenCalled();
  });
});
