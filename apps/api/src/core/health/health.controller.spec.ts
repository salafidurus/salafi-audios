import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { DbHealthIndicator } from './db-health.indicator';
import { RedisHealthIndicator } from './redis-health.indicator';
import { HealthService } from './health.service';
import { RedisService } from '../redis/redis.service';
import { AnalyticsDbHealthIndicator } from './analytics-db-health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dbHealth: { pingCheck: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cdnHealth: { pingCheck: any };
  let redisHealth: { pingCheck: any };
  let analyticsDbHealth: { pingCheck: any };

  beforeEach(async () => {
    dbHealth = {
      pingCheck: vi.fn<any>().mockResolvedValue({ database: { status: 'up' } }),
    };
    cdnHealth = {
      pingCheck: vi.fn<any>().mockResolvedValue({ cdn: { status: 'up' } }),
    };
    redisHealth = {
      pingCheck: vi.fn<any>().mockResolvedValue({ redis: { status: 'up' } }),
    };
    analyticsDbHealth = {
      pingCheck: vi.fn<any>().mockResolvedValue({ analyticsDatabase: { status: 'up' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: DbHealthIndicator, useValue: dbHealth },
        { provide: CDNHealthIndicator, useValue: cdnHealth },
        { provide: RedisHealthIndicator, useValue: redisHealth },
        { provide: RedisService, useValue: { enabled: false } },
        { provide: AnalyticsDbHealthIndicator, useValue: analyticsDbHealth },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('getHealth calls database and CDN indicators', async () => {
    await controller.getHealth();
    expect(dbHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 5000,
    });
    expect(cdnHealth.pingCheck).toHaveBeenCalledWith('cdn', {
      timeout: 5000,
    });
    expect(analyticsDbHealth.pingCheck).toHaveBeenCalledWith('analyticsDatabase');
  });

  it('getReadiness calls database indicator but not CDN indicator', async () => {
    await controller.getReadiness();
    expect(dbHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 5000,
    });
    expect(cdnHealth.pingCheck).not.toHaveBeenCalled();
    expect(analyticsDbHealth.pingCheck).toHaveBeenCalledWith('analyticsDatabase');
  });

  it('getLiveness succeeds with no indicator calls', async () => {
    const result = await controller.getLiveness();
    expect(result.status).toBe('ok');
    expect(dbHealth.pingCheck).not.toHaveBeenCalled();
    expect(cdnHealth.pingCheck).not.toHaveBeenCalled();
    expect(analyticsDbHealth.pingCheck).not.toHaveBeenCalled();
  });
});
