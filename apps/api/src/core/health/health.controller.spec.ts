import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { DbHealthIndicator } from './db-health.indicator';
import { RedisHealthIndicator } from './redis-health.indicator';
import { RedisService } from '../redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dbHealth: { pingCheck: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cdnHealth: { pingCheck: any };
  let redisHealth: { pingCheck: any };

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

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        { provide: DbHealthIndicator, useValue: dbHealth },
        { provide: CDNHealthIndicator, useValue: cdnHealth },
        { provide: RedisHealthIndicator, useValue: redisHealth },
        { provide: RedisService, useValue: { enabled: false } },
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
  });

  it('getReadiness calls database indicator but not CDN indicator', async () => {
    await controller.getReadiness();
    expect(dbHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 5000,
    });
    expect(cdnHealth.pingCheck).not.toHaveBeenCalled();
  });

  it('getLiveness succeeds with no indicator calls', async () => {
    const result = await controller.getLiveness();
    expect(result.status).toBe('ok');
    expect(dbHealth.pingCheck).not.toHaveBeenCalled();
    expect(cdnHealth.pingCheck).not.toHaveBeenCalled();
  });
});
