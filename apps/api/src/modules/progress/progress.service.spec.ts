import { Test, TestingModule } from '@nestjs/testing';
import type {
  LectureProgressDto,
  ProgressSyncItemDto,
} from '@sd/core-contracts';
import { ProgressRepository } from './progress.repo';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let repo: jest.Mocked<ProgressRepository>;

  const mockProgress: LectureProgressDto[] = [
    {
      lectureId: 'l1',
      positionSeconds: 900,
      durationSeconds: 1800,
      updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    },
    {
      lectureId: 'l2',
      positionSeconds: 1800,
      durationSeconds: 1800,
      completedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: ProgressRepository,
          useValue: {
            getUserProgress: jest.fn(),
            upsertProgress: jest.fn(),
            bulkSync: jest.fn(),
          } satisfies Partial<jest.Mocked<ProgressRepository>>,
        },
      ],
    }).compile();

    service = module.get(ProgressService);
    repo = module.get(ProgressRepository) as jest.Mocked<ProgressRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProgress', () => {
    it('should return all progress records for user', async () => {
      repo.getUserProgress.mockResolvedValue(mockProgress);

      const result = await service.getUserProgress('user1');

      expect(result).toEqual(mockProgress);
      expect(repo.getUserProgress).toHaveBeenCalledWith('user1');
    });

    it('should return empty array when user has no progress', async () => {
      repo.getUserProgress.mockResolvedValue([]);

      const result = await service.getUserProgress('user1');

      expect(result).toEqual([]);
    });
  });

  describe('upsertProgress', () => {
    it('should call repo with all provided params', async () => {
      repo.upsertProgress.mockResolvedValue(undefined);

      await service.upsertProgress('user1', 'lecture1', 300, 1800, false);

      expect(repo.upsertProgress).toHaveBeenCalledWith(
        'user1',
        'lecture1',
        300,
        1800,
        false,
      );
    });

    it('should call repo with optional params as undefined when omitted', async () => {
      repo.upsertProgress.mockResolvedValue(undefined);

      await service.upsertProgress('user1', 'lecture1', 300);

      expect(repo.upsertProgress).toHaveBeenCalledWith(
        'user1',
        'lecture1',
        300,
        undefined,
        undefined,
      );
    });

    it('should mark lecture as completed when isCompleted is true', async () => {
      repo.upsertProgress.mockResolvedValue(undefined);

      await service.upsertProgress('user1', 'lecture1', 1800, 1800, true);

      expect(repo.upsertProgress).toHaveBeenCalledWith(
        'user1',
        'lecture1',
        1800,
        1800,
        true,
      );
    });
  });

  describe('bulkSync', () => {
    it('should sync multiple progress items for user', async () => {
      const items: ProgressSyncItemDto[] = [
        {
          lectureId: 'l1',
          positionSeconds: 300,
          durationSeconds: 1800,
          updatedAt: new Date().toISOString(),
        },
        {
          lectureId: 'l2',
          positionSeconds: 1800,
          durationSeconds: 1800,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      repo.bulkSync.mockResolvedValue(undefined);

      await service.bulkSync('user1', items);

      expect(repo.bulkSync).toHaveBeenCalledWith('user1', items);
    });

    it('should handle empty items array', async () => {
      repo.bulkSync.mockResolvedValue(undefined);

      await service.bulkSync('user1', []);

      expect(repo.bulkSync).toHaveBeenCalledWith('user1', []);
    });
  });
});
