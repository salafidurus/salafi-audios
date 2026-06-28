import { vi, type Mocked } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import type { FeedPageDto } from '@sd/core-contracts';
import { FeedRepo } from './feed.repo';
import { FeedService } from './feed.service';

describe('FeedService', () => {
  let service: FeedService;
  let repo: Mocked<FeedRepo>;

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
        FeedService,
        {
          provide: FeedRepo,
          useValue: {
            getFeed: vi.fn(),
            getFeedRecent: vi.fn(),
            getScholars: vi.fn(),
          } satisfies Partial<Mocked<FeedRepo>>,
        },
      ],
    }).compile();

    service = module.get(FeedService);
    repo = module.get(FeedRepo) as Mocked<FeedRepo>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should pass all parameters to repository and return result', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      const result = await service.getFeed('cursor1', 10, ['aqeedah'], ['scholar-1']);

      expect(result).toEqual(mockFeedPage);
      expect(repo.getFeed).toHaveBeenCalledWith('cursor1', 10, ['aqeedah'], ['scholar-1']);
    });

    it('should use default limit of 20 when not provided', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      await service.getFeed();

      expect(repo.getFeed).toHaveBeenCalledWith(undefined, 20, undefined, undefined);
    });

    it('should forward undefined optional params to repository', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      await service.getFeed('cursor1');

      expect(repo.getFeed).toHaveBeenCalledWith('cursor1', 20, undefined, undefined);
    });
  });

  describe('getFeedRecent', () => {
    it('should delegate to repo.getFeedRecent and return result sorted by createdAt DESC', async () => {
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
      repo.getFeedRecent.mockResolvedValue(recentPage);

      const result = await service.getFeedRecent('cursor1', 10);

      expect(result).toEqual(recentPage);
      expect(repo.getFeedRecent).toHaveBeenCalledWith('cursor1', 10);
    });

    it('should use default limit of 20 when not provided', async () => {
      repo.getFeedRecent.mockResolvedValue(mockFeedPage);

      await service.getFeedRecent();

      expect(repo.getFeedRecent).toHaveBeenCalledWith(undefined, 20);
    });
  });

  describe('getFollowingFeed', () => {
    it('should delegate to repo.getFeed and return result', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      const result = await service.getFollowingFeed('cursor1', 10);

      expect(result).toEqual(mockFeedPage);
      expect(repo.getFeed).toHaveBeenCalledWith('cursor1', 10);
    });

    it('should use default limit of 20 when not provided', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      await service.getFollowingFeed();

      expect(repo.getFeed).toHaveBeenCalledWith(undefined, 20);
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
