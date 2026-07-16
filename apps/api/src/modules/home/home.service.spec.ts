import { vi, type Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import type { QuickBrowseDto } from '@sd/core-contracts';
import { HomeRepo } from './home.repo';
import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;
  let repo: Mocked<HomeRepo>;

  const mockScholars = [
    { id: 's1', name: 'Scholar 1', slug: 'scholar-1', imageUrl: 'image1.jpg' },
    { id: 's2', name: 'Scholar 2', slug: 'scholar-2', imageUrl: null },
  ];

  const mockSuggestions = [
    {
      id: 'l1',
      slug: 'lecture-1',
      title: 'Suggested Lecture 1',
      kind: 'single' as const,
      scholarName: 'Scholar 1',
      scholarSlug: 'scholar-1',
      thumbnailUrl: null,
      durationSeconds: 1800,
    },
  ];

  const mockRecentProgress = {
    lectureId: 'l2',
    lectureTitle: 'Recent Lecture',
    lectureSlug: 'lecture-2',
    scholarName: 'Scholar 2',
    durationSeconds: 2400,
    positionSeconds: 1200,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: HomeRepo,
          useValue: {
            getScholars: vi.fn<any>(),
            getSuggestions: vi.fn<any>(),
            getRecentProgress: vi.fn<any>(),
          } as Partial<Mocked<HomeRepo>>,
        },
      ],
    }).compile();

    service = module.get(HomeService);
    repo = module.get(HomeRepo) as Mocked<HomeRepo>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getQuickBrowse', () => {
    it('should return quick browse data with user progress', async () => {
      repo.getScholars.mockResolvedValue(mockScholars);
      repo.getSuggestions.mockResolvedValue(mockSuggestions);
      repo.getRecentProgress.mockResolvedValue(mockRecentProgress);

      const result = await service.getQuickBrowse(['aqeedah', 'fiqh'], ['scholar-1'], 'user123');

      const expected: QuickBrowseDto = {
        scholars: mockScholars,
        suggestions: mockSuggestions,
        recentProgress: mockRecentProgress,
      };

      expect(result).toEqual(expected);
      expect(repo.getScholars).toHaveBeenCalledTimes(1);
      expect(repo.getSuggestions).toHaveBeenCalledTimes(1);
      expect(repo.getRecentProgress).toHaveBeenCalledWith('user123');
    });

    it('should return quick browse data without user progress when userId not provided', async () => {
      repo.getScholars.mockResolvedValue(mockScholars);
      repo.getSuggestions.mockResolvedValue(mockSuggestions);

      const result = await service.getQuickBrowse(['aqeedah'], ['scholar-1']);

      const expected: QuickBrowseDto = {
        scholars: mockScholars,
        suggestions: mockSuggestions,
        recentProgress: null,
      };

      expect(result).toEqual(expected);
      expect(repo.getScholars).toHaveBeenCalledTimes(1);
      expect(repo.getSuggestions).toHaveBeenCalledTimes(1);
      expect(repo.getRecentProgress).not.toHaveBeenCalled();
    });

    it('should handle parallel requests correctly', async () => {
      repo.getScholars.mockResolvedValue(mockScholars);
      repo.getSuggestions.mockResolvedValue(mockSuggestions);
      repo.getRecentProgress.mockResolvedValue(mockRecentProgress);

      const result = await service.getQuickBrowse(undefined, undefined, 'user123');

      expect(result.scholars).toEqual(mockScholars);
      expect(result.suggestions).toEqual(mockSuggestions);
      expect(result.recentProgress).toEqual(mockRecentProgress);

      // Verify all calls were made in parallel
      expect(repo.getScholars).toHaveBeenCalledTimes(1);
      expect(repo.getSuggestions).toHaveBeenCalledTimes(1);
      expect(repo.getRecentProgress).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results from repository', async () => {
      repo.getScholars.mockResolvedValue([]);
      repo.getSuggestions.mockResolvedValue([]);
      repo.getRecentProgress.mockResolvedValue(null);

      const result = await service.getQuickBrowse([], [], 'user123');

      expect(result).toEqual({
        scholars: [],
        suggestions: [],
        recentProgress: null,
      });
    });
  });
});
