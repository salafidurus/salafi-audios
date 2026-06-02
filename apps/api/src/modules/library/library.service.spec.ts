import { Test, TestingModule } from '@nestjs/testing';
import type { LibraryPageDto } from '@sd/core-contracts';
import { LibraryRepository } from './library.repo';
import { LibraryService } from './library.service';

describe('LibraryService', () => {
  let service: LibraryService;
  let repo: jest.Mocked<LibraryRepository>;

  const mockLibraryPage: LibraryPageDto = {
    items: [
      {
        id: 'lib1',
        lectureId: 'l1',
        lectureSlug: 'test-lecture',
        lectureTitle: 'Test Lecture',
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
        LibraryService,
        {
          provide: LibraryRepository,
          useValue: {
            findInProgress: jest.fn(),
            findCompleted: jest.fn(),
            findSaved: jest.fn(),
            saveLecture: jest.fn(),
            unsaveLecture: jest.fn(),
            bulkSave: jest.fn(),
          } satisfies Partial<jest.Mocked<LibraryRepository>>,
        },
      ],
    }).compile();

    service = module.get(LibraryService);
    repo = module.get(LibraryRepository) as jest.Mocked<LibraryRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInProgress', () => {
    it('should return in-progress items with pagination', async () => {
      const repoResult = {
        items: mockLibraryPage.items,
        nextCursor: 'cursor123',
      };
      repo.findInProgress.mockResolvedValue(repoResult);

      const result = await service.getInProgress('user1', 'cursor456');

      expect(result).toEqual({
        items: mockLibraryPage.items,
        nextCursor: 'cursor123',
        hasMore: true,
      });
      expect(repo.findInProgress).toHaveBeenCalledWith('user1', 'cursor456');
    });

    it('should return hasMore false when no nextCursor', async () => {
      const repoResult = {
        items: mockLibraryPage.items,
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
        items: mockLibraryPage.items,
        nextCursor: 'cursor789',
      };
      repo.findCompleted.mockResolvedValue(repoResult);

      const result = await service.getCompleted('user1', 'cursor101');

      expect(result).toEqual({
        items: mockLibraryPage.items,
        nextCursor: 'cursor789',
        hasMore: true,
      });
      expect(repo.findCompleted).toHaveBeenCalledWith('user1', 'cursor101');
    });
  });

  describe('getSaved', () => {
    it('should return saved items with pagination', async () => {
      const repoResult = {
        items: mockLibraryPage.items,
        nextCursor: undefined,
      };
      repo.findSaved.mockResolvedValue(repoResult);

      const result = await service.getSaved('user1');

      expect(result).toEqual({
        items: mockLibraryPage.items,
        nextCursor: undefined,
        hasMore: false,
      });
      expect(repo.findSaved).toHaveBeenCalledWith('user1', undefined);
    });
  });

  describe('saveLecture', () => {
    it('should save lecture for user', async () => {
      repo.saveLecture.mockResolvedValue(undefined);

      await service.saveLecture('user1', 'lecture1');

      expect(repo.saveLecture).toHaveBeenCalledWith('user1', 'lecture1');
    });
  });

  describe('unsaveLecture', () => {
    it('should unsave lecture for user', async () => {
      repo.unsaveLecture.mockResolvedValue(undefined);

      await service.unsaveLecture('user1', 'lecture1');

      expect(repo.unsaveLecture).toHaveBeenCalledWith('user1', 'lecture1');
    });
  });

  describe('bulkSave', () => {
    it('should bulk save lectures for user', async () => {
      const lectureIds = ['lecture1', 'lecture2', 'lecture3'];
      repo.bulkSave.mockResolvedValue(undefined);

      await service.bulkSave('user1', lectureIds);

      expect(repo.bulkSave).toHaveBeenCalledWith('user1', lectureIds);
    });

    it('should handle empty lecture ids array', async () => {
      repo.bulkSave.mockResolvedValue(undefined);

      await service.bulkSave('user1', []);

      expect(repo.bulkSave).toHaveBeenCalledWith('user1', []);
    });
  });
});
