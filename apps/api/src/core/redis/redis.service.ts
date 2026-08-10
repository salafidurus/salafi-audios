import type { ThrottlerStorage } from '@nestjs/throttler';
import type { KeyvStoreAdapter } from 'keyv';

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RedisService.name);
    if (!config.REDIS_URL) {
      this.logger.warn('REDIS_URL is not configured; Redis-backed features are disabled');
      return;
    }

    this.client = new Redis(config.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2_000,
      commandTimeout: 2_000,
      retryStrategy: (attempt) => Math.min(attempt * 250, 2_000),
    });

    this.client.on('error', (error) => this.logger.error({ err: error }, 'Redis error'));
    this.client.on('connect', () => this.logger.info('Redis connected'));
  }

  get enabled(): boolean {
    return this.client !== undefined;
  }

  get namespace(): string {
    return `sd:${this.config.NODE_ENV}:api:`;
  }

  get rawClient(): Redis | undefined {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.requireClient().get(key);
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return keys.length === 0 ? [] : this.requireClient().mget(...keys);
  }

  async set(
    key: string,
    value: string,
    mode?: 'EX' | 'PX',
    duration?: number,
    condition?: 'NX' | 'XX',
  ): Promise<string | null> {
    const args: (string | number)[] = [key, value];
    if (mode && duration !== undefined) args.push(mode, duration);
    if (condition) args.push(condition);
    return Reflect.apply(this.requireClient().set, this.requireClient(), args) as Promise<
      string | null
    >;
  }

  async del(...keys: string[]): Promise<number> {
    return this.requireClient().del(...keys);
  }

  async incr(key: string): Promise<number> {
    return this.requireClient().incr(key);
  }

  async pexpire(key: string, milliseconds: number): Promise<number> {
    return this.requireClient().pexpire(key, milliseconds);
  }

  async pttl(key: string): Promise<number> {
    return this.requireClient().pttl(key);
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.requireClient().zadd(key, score, member);
  }

  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    limit?: { offset: number; count: number },
  ): Promise<string[]> {
    if (!limit) return this.requireClient().zrangebyscore(key, min, max);
    return this.requireClient().zrangebyscore(key, min, max, 'LIMIT', limit.offset, limit.count);
  }

  async eval<T = unknown>(script: string, numberOfKeys: number, ...args: string[]): Promise<T> {
    return this.requireClient().eval(script, numberOfKeys, ...args) as Promise<T>;
  }

  async ping(): Promise<string> {
    return this.requireClient().ping();
  }

  createCacheStore(): KeyvStoreAdapter {
    const namespace = `${this.namespace}cache:`;
    return {
      opts: {},
      namespace,
      on: () => this.createCacheStore(),
      get: async <Value>(key: string) => {
        const value = await this.get(`${namespace}${key}`);
        if (value === null) return undefined;
        return JSON.parse(value) as Value;
      },
      set: async (key: string, value: unknown, ttl?: number) => {
        await this.set(`${namespace}${key}`, JSON.stringify(value), 'PX', ttl ?? 300_000);
      },
      delete: async (key: string) => (await this.del(`${namespace}${key}`)) > 0,
      clear: async () => {
        await this.eval(
          `local cursor = '0'
           repeat
             local result = redis.call('SCAN', cursor, 'MATCH', ARGV[1], 'COUNT', 100)
             cursor = result[1]
             for _, key in ipairs(result[2]) do redis.call('DEL', key) end
           until cursor == '0'
           return 1`,
          0,
          `${namespace}*`,
        );
      },
    };
  }

  createThrottlerStorage(): ThrottlerStorage {
    return {
      increment: async (key, ttl) => {
        const redisKey = `${this.namespace}throttle:${key}`;
        const totalHits = await this.incr(redisKey);
        if (totalHits === 1) await this.pexpire(redisKey, ttl);
        const remaining = await this.pttl(redisKey);
        return {
          totalHits,
          timeToExpire: Math.max(remaining, 0),
          isBlocked: false,
          timeToBlockExpire: 0,
        };
      },
    } satisfies ThrottlerStorage;
  }

  async quit(): Promise<void> {
    if (this.client) await this.client.quit();
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }

  private requireClient(): Redis {
    if (!this.client) throw new RedisUnavailableError();
    return this.client;
  }
}

export class RedisUnavailableError extends Error {
  constructor() {
    super('Redis is not configured or unavailable');
    this.name = 'RedisUnavailableError';
  }
}
