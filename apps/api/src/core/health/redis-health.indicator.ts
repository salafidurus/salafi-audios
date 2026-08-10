import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redis: RedisService) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    if (!this.redis.enabled) return this.getStatus(key, true, { configured: false });

    try {
      await this.redis.ping();
      return this.getStatus(key, true, { configured: true });
    } catch (error) {
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, {
          configured: true,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
}
