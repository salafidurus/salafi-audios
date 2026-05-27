import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import type {
  AudioProgressDto,
  ProgressSyncItemDto,
} from '@sd/core-contracts';
import { AudioRepository } from './audio.repo';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;
  let repo: jest.Mocked<AudioRepository>;

  const mockProgress: AudioProgressDto[] = [
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
        AudioService,
        {
          provide: AudioRepository,
          useValue: {
            getUserProgress: jest.fn(),
            upsertProgress: jest.fn(),
            bulkSync: jest.fn(),
            findLectureById: jest.fn(),
            findPrimaryAsset: jest.fn(),
            findFirstAsset: jest.fn(),
          } satisfies Partial<jest.Mocked<AudioRepository>>,
        },
      ],
    }).compile();

    service = module.get(AudioService);
    repo = module.get(AudioRepository) as jest.Mocked<AudioRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProgress', () => {
    it('should return all progress records for user without since date', async () => {
      repo.getUserProgress.mockResolvedValue(mockProgress);

      const result = await service.getUserProgress('user1');

      expect(result).toEqual(mockProgress);
      expect(repo.getUserProgress).toHaveBeenCalledWith('user1', undefined);
    });

    it('should pass parsed since date to repo when since query is provided', async () => {
      repo.getUserProgress.mockResolvedValue(mockProgress);

      const sinceStr = '2026-05-25T12:00:00.000Z';
      const result = await service.getUserProgress('user1', sinceStr);

      expect(result).toEqual(mockProgress);
      expect(repo.getUserProgress).toHaveBeenCalledWith('user1', new Date(sinceStr));
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
      ];
      repo.bulkSync.mockResolvedValue(undefined);

      await service.bulkSync('user1', items);

      expect(repo.bulkSync).toHaveBeenCalledWith('user1', items);
    });
  });

  describe('resolveStreamUrl', () => {
    const mockLecture = { id: 'l1', durationSeconds: 1200 } as any;

    it('should throw NotFoundException when lecture does not exist', async () => {
      repo.findLectureById.mockResolvedValue(null);

      await expect(service.resolveStreamUrl('l1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the primary audio asset if available', async () => {
      repo.findLectureById.mockResolvedValue(mockLecture);
      repo.findPrimaryAsset.mockResolvedValue({ url: 'https://primary.mp3', durationSeconds: 1200, format: 'mp3', isPrimary: true } as any);

      const result = await service.resolveStreamUrl('l1');

      expect(result).toEqual({
        url: 'https://primary.mp3',
        durationSeconds: 1200,
        format: 'mp3',
      });
      expect(repo.findLectureById).toHaveBeenCalledWith('l1');
      expect(repo.findPrimaryAsset).toHaveBeenCalledWith('l1');
    });

    it('should fallback to the first audio asset if no primary asset exists', async () => {
      repo.findLectureById.mockResolvedValue(mockLecture);
      repo.findPrimaryAsset.mockResolvedValue(null);
      repo.findFirstAsset.mockResolvedValue({ url: 'https://fallback.mp3', durationSeconds: 1200, format: 'mp3', isPrimary: false } as any);

      const result = await service.resolveStreamUrl('l1');

      expect(result).toEqual({
        url: 'https://fallback.mp3',
        durationSeconds: 1200,
        format: 'mp3',
      });
      expect(repo.findLectureById).toHaveBeenCalledWith('l1');
      expect(repo.findPrimaryAsset).toHaveBeenCalledWith('l1');
      expect(repo.findFirstAsset).toHaveBeenCalledWith('l1');
    });

    it('should throw NotFoundException if no audio assets exist at all', async () => {
      repo.findLectureById.mockResolvedValue(mockLecture);
      repo.findPrimaryAsset.mockResolvedValue(null);
      repo.findFirstAsset.mockResolvedValue(null);

      await expect(service.resolveStreamUrl('l1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
