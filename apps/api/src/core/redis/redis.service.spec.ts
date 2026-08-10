import { describe, expect, it } from 'bun:test';

import { RedisService } from './redis.service';

const logger = {
  setContext: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  info: () => undefined,
};

describe('RedisService', () => {
  it('is disabled when REDIS_URL is absent', () => {
    const service = new RedisService(
      { NODE_ENV: 'test', REDIS_URL: undefined } as any,
      logger as any,
    );
    expect(service.enabled).toBe(false);
    expect(service.rawClient).toBeUndefined();
  });

  it('throws a controlled error when commands are used while disabled', async () => {
    const service = new RedisService(
      { NODE_ENV: 'test', REDIS_URL: undefined } as any,
      logger as any,
    );
    await expect(service.get('key')).rejects.toThrow('Redis is not configured or unavailable');
  });

  it('creates a client when REDIS_URL is configured', async () => {
    const service = new RedisService(
      {
        NODE_ENV: 'test',
        REDIS_URL: 'redis://localhost:6379',
      } as any,
      logger as any,
    );
    expect(service.enabled).toBe(true);
    expect(service.rawClient).toBeDefined();
    service.rawClient?.disconnect();
  });
});
