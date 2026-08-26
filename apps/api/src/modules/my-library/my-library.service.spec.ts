import type { Mocked } from '../../test/setup';
import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import type { MyLibraryPageDto, SavedDeltaItemDto } from '@sd/core-contracts';
import { MyLibraryRepository } from './my-library.repo';
import { MyLibraryService } from './my-library.service';

describe('MyLibraryService', () => {
  let service: MyLibraryService;
  let repo: Mocked<MyLibraryRepository>;

  const mockMyLibraryPage: MyLibraryPageDto = {
    items: [
      {
        id: 'lib1',
        listingId: 'l1',
        listingSlug: 'test-listing',
        listingTitle: 'Test Listing',
        durationSeconds: 1800,
        progressSeconds: 900,
        scholarId: 's1',
        scholarSlug: 'test-scholar',
        scholarName: 'Test Scholar',
      },
    ],
    nextCursor: 'cursor123',
    hasMore: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyLibraryService,
        {
          provide: MyLibraryRepository,
          useValue: {
            findInProgress: vi.fn<any>(),
            findCompleted: vi.fn<any>(),
            findSaved: vi.fn<any>(),
            findSavedDelta: vi.fn<any>(),
            saveLecture: vi.fn<any>(),
            unsaveLecture: vi.fn<any>(),
            bulkSync: vi.fn<any>(),
          } as Partial<Mocked<MyLibraryRepository>>,
        },
      ],
    }).compile();

    service = module.get(MyLibraryService);
    repo = module.get(MyLibraryRepository) as Mocked<MyLibraryRepository>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInProgress', () => {
    it('should return in-progress items with pagination', async () => {
      const repoResult = {
        items: mockMyLibraryPage.items,
        nextCursor: 'cursor123',
      };
      repo.findInProgress.mockResolvedValue(repoResult);

      const result = await service.getInProgress('user1', 'cursor456');

      expect(result).toEqual({
        items: mockMyLibraryPage.items,
        nextCursor: 'cursor123',
        hasMore: true,
      });
      expect(repo.findInProgress).toHaveBeenCalledWith('user1', 'cursor456');
    });

    it('should return hasMore false when no nextCursor', async () => {
      const repoResult = {
        items: mockMyLibraryPage.items,
        nextCursor: undefined,
      };
      repo.findInProgress.mockResolvedValue(repoResult);

      const result = await service.getInProgress('user1');

      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeUndefined();
    });
  });

  describe('getCompleted', () => {
    it('should return completed items with pagination', async () => {
      const repoResult = {
        items: mockMyLibraryPage.items,
        nextCursor: 'cursor789',
      };
      repo.findCompleted.mockResolvedValue(repoResult);

      const result = await service.getCompleted('user1', 'cursor101');

      expect(result).toEqual({
        items: mockMyLibraryPage.items,
        nextCursor: 'cursor789',
        hasMore: true,
      });
      expect(repo.findCompleted).toHaveBeenCalledWith('user1', 'cursor101');
    });
  });

  describe('getSaved', () => {
    it('should return saved items with pagination', async () => {
      const repoResult = {
        items: mockMyLibraryPage.items,
        nextCursor: undefined,
      };
      repo.findSaved.mockResolvedValue(repoResult);

      const result = await service.getSaved('user1');

      expect(result).toEqual({
        items: mockMyLibraryPage.items,
        nextCursor: undefined,
        hasMore: false,
      });
      expect(repo.findSaved).toHaveBeenCalledWith('user1', undefined);
    });
  });

  describe('saveListing', () => {
    it('should save listing for user', async () => {
      repo.saveLecture.mockResolvedValue(true);

      await service.saveListing('user1', 'listing1');

      expect(repo.saveLecture).toHaveBeenCalledWith('user1', 'listing1');
    });

    it('should throw NotFoundException when the listing id/slug cannot be resolved', async () => {
      repo.saveLecture.mockResolvedValue(false);

      await expect(service.saveListing('user1', 'missing-slug')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unsaveListing', () => {
    it('should unsave listing for user', async () => {
      repo.unsaveLecture.mockResolvedValue(true);

      await service.unsaveListing('user1', 'listing1');

      expect(repo.unsaveLecture).toHaveBeenCalledWith('user1', 'listing1');
    });

    it('should throw NotFoundException when the listing id/slug cannot be resolved', async () => {
      repo.unsaveLecture.mockResolvedValue(false);

      await expect(service.unsaveListing('user1', 'missing-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bulkSyncSaved', () => {
    it('should bulk sync saved items for user', async () => {
      const items = [{ listingId: 'listing1', saved: true, updatedAt: '2026-01-01T00:00:00.000Z' }];
      repo.bulkSync.mockResolvedValue(undefined);

      await service.bulkSyncSaved('user1', items);

      expect(repo.bulkSync).toHaveBeenCalledWith('user1', items);
    });

    it('should handle an empty items array', async () => {
      repo.bulkSync.mockResolvedValue(undefined);

      await service.bulkSyncSaved('user1', []);

      expect(repo.bulkSync).toHaveBeenCalledWith('user1', []);
    });
  });

  describe('getSavedDelta', () => {
    it('returns the repo result as-is (no pagination envelope, unlike getSaved)', async () => {
      const delta: SavedDeltaItemDto[] = [
        {
          listingId: 'l1',
          updatedAt: '2026-01-02T00:00:00.000Z',
          savedAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      repo.findSavedDelta.mockResolvedValue(delta);

      const result = await service.getSavedDelta('user1', '2026-01-01T00:00:00.000Z');

      expect(result).toEqual(delta);
      expect(repo.findSavedDelta).toHaveBeenCalledWith(
        'user1',
        new Date('2026-01-01T00:00:00.000Z'),
      );
    });

    it('passes undefined through as no cursor when since is omitted', async () => {
      repo.findSavedDelta.mockResolvedValue([]);

      await service.getSavedDelta('user1');

      expect(repo.findSavedDelta).toHaveBeenCalledWith('user1', undefined);
    });
  });
});
