import { beforeEach, describe, expect, it, vi } from 'bun:test';
import { BadRequestException } from '@nestjs/common';
import { ListingEditorialService } from './listing-editorial.service';

describe('ListingEditorialService', () => {
  let service: ListingEditorialService;
  let repo: { updateListingMedia: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repo = { updateListingMedia: vi.fn() };
    service = new ListingEditorialService(repo as never, { del: vi.fn() } as never);
  });

  it('requires an audio key for an explicit media replacement', async () => {
    await expect(service.replace('listing-1', {})).rejects.toThrow(BadRequestException);
    expect(repo.updateListingMedia).not.toHaveBeenCalled();
  });
});
