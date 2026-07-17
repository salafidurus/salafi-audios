import type { Mocked } from '../../test/setup';
import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import type { FeedPageDto } from '@sd/core-contracts';
import { ExploreRepo } from './explore.repo';
import { ExploreService } from './explore.service';

describe('ExploreService', () => {
  let service: ExploreService;
  let repo: Mocked<ExploreRepo>;

  const mockFeedPage: FeedPageDto = {
    items: [
      {
        kind: 'single',
        id: 'l1',
        slug: 'test-lecture',
        title: 'Test Lecture',
        scholarName: 'Test Scholar',
        scholarSlug: 'test-scholar',
        thumbnailUrl: null,
        durationSeconds: 1800,
        publishedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    nextCursor: undefined,
  };

  const mockScholars = [
    { id: 's1', name: 'Scholar 1', slug: 'scholar-1', imageUrl: null },
    { id: 's2', name: 'Scholar 2', slug: 'scholar-2', imageUrl: 'img.jpg' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExploreService,
        {
          provide: ExploreRepo,
          useValue: {
            getExplore: vi.fn<any>(),
            getExploreRecent: vi.fn<any>(),
            getScholars: vi.fn<any>(),
          } as Partial<Mocked<ExploreRepo>>,
        },
      ],
    }).compile();

    service = module.get(ExploreService);
    repo = module.get(ExploreRepo) as Mocked<ExploreRepo>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getExplore', () => {
    it('should pass all parameters to repository and return result', async () => {
      repo.getExplore.mockResolvedValue(mockFeedPage);

      const result = await service.getExplore('cursor1', 10, ['aqeedah'], ['scholar-1']);

      expect(result).toEqual(mockFeedPage);
      expect(repo.getExplore).toHaveBeenCalledWith('cursor1', 10, ['aqeedah'], ['scholar-1']);
    });

    it('should use default limit of 20 when not provided', async () => {
      repo.getExplore.mockResolvedValue(mockFeedPage);

      await service.getExplore();

      expect(repo.getExplore).toHaveBeenCalledWith(undefined, 20, undefined, undefined);
    });

    it('should forward undefined optional params to repository', async () => {
      repo.getExplore.mockResolvedValue(mockFeedPage);

      await service.getExplore('cursor1');

      expect(repo.getExplore).toHaveBeenCalledWith('cursor1', 20, undefined, undefined);
    });
  });

  describe('getExploreRecent', () => {
    it('should delegate to repo.getExploreRecent and return result sorted by createdAt DESC', async () => {
      const recentPage: FeedPageDto = {
        items: [
          {
            kind: 'single',
            id: 'r1',
            slug: 'recent-lecture',
            title: 'Recent Lecture',
            scholarName: 'Scholar',
            scholarSlug: 'scholar',
            thumbnailUrl: null,
            durationSeconds: 600,
            publishedAt: '2024-06-01T00:00:00.000Z',
          },
        ],
        nextCursor: undefined,
      };
      repo.getExploreRecent.mockResolvedValue(recentPage);

      const result = await service.getExploreRecent('cursor1', 10);

      expect(result).toEqual(recentPage);
      expect(repo.getExploreRecent).toHaveBeenCalledWith('cursor1', 10);
    });

    it('should use default limit of 20 when not provided', async () => {
      repo.getExploreRecent.mockResolvedValue(mockFeedPage);

      await service.getExploreRecent();

      expect(repo.getExploreRecent).toHaveBeenCalledWith(undefined, 20);
    });
  });

  describe('getFollowingExplore', () => {
    it('should delegate to repo.getExplore and return result', async () => {
      repo.getExplore.mockResolvedValue(mockFeedPage);

      const result = await service.getFollowingExplore('cursor1', 10);

      expect(result).toEqual(mockFeedPage);
      expect(repo.getExplore).toHaveBeenCalledWith('cursor1', 10);
    });

    it('should use default limit of 20 when not provided', async () => {
      repo.getExplore.mockResolvedValue(mockFeedPage);

      await service.getFollowingExplore();

      expect(repo.getExplore).toHaveBeenCalledWith(undefined, 20);
    });
  });

  describe('getScholars', () => {
    it('should return scholars wrapped in object', async () => {
      repo.getScholars.mockResolvedValue(mockScholars as any);

      const result = await service.getScholars();

      expect(result).toEqual({ scholars: mockScholars });
      expect(repo.getScholars).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no scholars', async () => {
      repo.getScholars.mockResolvedValue([]);

      const result = await service.getScholars();

      expect(result).toEqual({ scholars: [] });
    });
  });
});
