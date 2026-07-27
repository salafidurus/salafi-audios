import { describe, it, expect, vi, beforeEach } from 'bun:test';
import { ListingRepository } from './listing.repo';
import { Status } from '@sd/core-db';
import type { CreateListingDto } from './dto/create-listing.dto';

describe('ListingRepository.createWithAudioAsset', () => {
  let repo: ListingRepository;
  let listingCreateSpy: any;
  let prisma: any;

  beforeEach(() => {
    listingCreateSpy = vi
      .fn()
      .mockResolvedValue({ id: 'listing-1', title: 'Test Listing', parentId: null });

    const tx = {
      listing: { create: listingCreateSpy },
      listingTopic: { createMany: vi.fn() },
      audioAsset: { create: vi.fn() },
      listingTranslation: { upsert: vi.fn() },
    };

    prisma = {
      $transaction: vi.fn((cb: (tx: unknown) => unknown) => cb(tx)),
    };

    repo = new ListingRepository(prisma);
  });

  it('persists the status provided in the DTO', async () => {
    const dto: CreateListingDto = {
      title: 'Test Listing',
      format: 'single',
      scholarId: 'scholar-1',
      status: 'review',
    };

    await repo.createWithAudioAsset(dto, 'user-1');

    expect(listingCreateSpy).toHaveBeenCalledTimes(1);
    const callArgs = listingCreateSpy.mock.calls[0][0];
    expect(callArgs.data.status).toBe('review');
  });

  it('defaults to draft status when none is provided', async () => {
    const dto: CreateListingDto = {
      title: 'Test Listing',
      format: 'single',
      scholarId: 'scholar-1',
    };

    await repo.createWithAudioAsset(dto, 'user-1');

    const callArgs = listingCreateSpy.mock.calls[0][0];
    expect(callArgs.data.status).toBe(Status.draft);
  });
});
