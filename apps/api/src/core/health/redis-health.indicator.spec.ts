import { describe, expect, it, vi } from 'bun:test';
import { RedisHealthIndicator } from './redis-health.indicator';
import { RedisService } from '../redis/redis.service';

describe('RedisHealthIndicator', () => {
  it('reports an unconfigured Redis dependency as up with metadata', async () => {
    const indicator = new RedisHealthIndicator({ enabled: false } as RedisService);

    await expect(indicator.pingCheck('redis')).resolves.toEqual({
      redis: { status: 'up', configured: false },
    });
  });

  it('reports configured Redis failures with diagnostics', async () => {
    const indicator = new RedisHealthIndicator({
      enabled: true,
      ping: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
    } as unknown as RedisService);

    await expect(indicator.pingCheck('redis')).rejects.toMatchObject({
      causes: {
        redis: { status: 'down', configured: true, error: 'Redis unavailable' },
      },
    });
  });
});
