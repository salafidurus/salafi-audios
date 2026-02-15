import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repo';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { PlatformStatsDto } from './dto/platform-stats.dto';
import {
  AnalyticsEventType,
  AnalyticsSource,
  AnalyticsContentKind,
} from '@sd/db';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let repo: jest.Mocked<AnalyticsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: AnalyticsRepository,
          useValue: {
            recordEvent: jest.fn(),
            getPlatformStats: jest.fn(),
          } satisfies Partial<jest.Mocked<AnalyticsRepository>>,
        },
      ],
    }).compile();

    service = module.get(AnalyticsService);
    repo = module.get(AnalyticsRepository) as jest.Mocked<AnalyticsRepository>;
  });

  describe('recordEvent', () => {
    it('delegates event recording to repository', async () => {
      const dto: CreateAnalyticsEventDto = {
        contentKind: AnalyticsContentKind.lecture,
        contentId: 'lec-123',
        eventType: AnalyticsEventType.play,
        source: AnalyticsSource.web,
      };

      repo.recordEvent.mockResolvedValue();

      await expect(service.recordEvent(dto)).resolves.toBeUndefined();

      expect(repo.recordEvent).toHaveBeenCalledWith(dto);
    });

    it('records event with default source when not provided', async () => {
      const dto: CreateAnalyticsEventDto = {
        contentKind: AnalyticsContentKind.series,
        contentId: 'ser-456',
        eventType: AnalyticsEventType.view,
      };

      repo.recordEvent.mockResolvedValue();

      await service.recordEvent(dto);

      expect(repo.recordEvent).toHaveBeenCalledWith(dto);
    });

    it('records different event types correctly', async () => {
      const eventTypes: AnalyticsEventType[] = [
        AnalyticsEventType.view,
        AnalyticsEventType.play,
        AnalyticsEventType.complete,
        AnalyticsEventType.save,
        AnalyticsEventType.share,
      ];

      for (const eventType of eventTypes) {
        const dto: CreateAnalyticsEventDto = {
          contentKind: AnalyticsContentKind.lecture,
          contentId: 'lec-123',
          eventType,
        };
        repo.recordEvent.mockResolvedValue();

        await service.recordEvent(dto);

        expect(repo.recordEvent).toHaveBeenCalledWith(dto);
      }
    });
  });

  describe('getPlatformStats', () => {
    it('returns platform statistics from repository', async () => {
      const stats: PlatformStatsDto = {
        totalScholars: 5,
        totalLectures: 100,
        lecturesPublishedLast30Days: 10,
      };

      repo.getPlatformStats.mockResolvedValue(stats);

      await expect(service.getPlatformStats()).resolves.toEqual(stats);

      expect(repo.getPlatformStats).toHaveBeenCalled();
    });

    it('returns zero counts when no data exists', async () => {
      const stats: PlatformStatsDto = {
        totalScholars: 0,
        totalLectures: 0,
        lecturesPublishedLast30Days: 0,
      };

      repo.getPlatformStats.mockResolvedValue(stats);

      await expect(service.getPlatformStats()).resolves.toEqual(stats);

      expect(repo.getPlatformStats).toHaveBeenCalled();
    });

    it('returns correct counts with sample data', async () => {
      const stats: PlatformStatsDto = {
        totalScholars: 3,
        totalLectures: 50,
        lecturesPublishedLast30Days: 5,
      };

      repo.getPlatformStats.mockResolvedValue(stats);

      const result = await service.getPlatformStats();

      expect(result.totalScholars).toBe(3);
      expect(result.totalLectures).toBe(50);
      expect(result.lecturesPublishedLast30Days).toBe(5);
    });
  });
});
