import { Test, TestingModule } from '@nestjs/testing';
import type { FeedPageDto } from '@sd/core-contracts';
import { FeedRepo } from './feed.repo';
import { FeedService } from './feed.service';

describe('FeedService', () => {
  let service: FeedService;
  let repo: jest.Mocked<FeedRepo>;

  const mockFeedPage: FeedPageDto = {
    items: [
      {
        kind: 'lecture',
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
            getFeed: jest.fn(),
            getScholars: jest.fn(),
          } satisfies Partial<jest.Mocked<FeedRepo>>,
        },
      ],
    }).compile();

    service = module.get(FeedService);
    repo = module.get(FeedRepo) as jest.Mocked<FeedRepo>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should pass all parameters to repository and return result', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      const result = await service.getFeed(
        'cursor1',
        10,
        ['aqeedah'],
        ['scholar-1'],
      );

      expect(result).toEqual(mockFeedPage);
      expect(repo.getFeed).toHaveBeenCalledWith(
        'cursor1',
        10,
        ['aqeedah'],
        ['scholar-1'],
      );
    });

    it('should use default limit of 20 when not provided', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      await service.getFeed();

      expect(repo.getFeed).toHaveBeenCalledWith(
        undefined,
        20,
        undefined,
        undefined,
      );
    });

    it('should forward undefined optional params to repository', async () => {
      repo.getFeed.mockResolvedValue(mockFeedPage);

      await service.getFeed('cursor1');

      expect(repo.getFeed).toHaveBeenCalledWith(
        'cursor1',
        20,
        undefined,
        undefined,
      );
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
