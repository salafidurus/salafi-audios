import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import {
  createHealthIndicatorResult,
  HealthCheckError,
  type HealthIndicatorResult,
} from './health.service';

/** NestJS redis health indicator service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** Core API redis health.indicator module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class RedisHealthIndicator {
  constructor(private readonly redis: RedisService) {}

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    if (!this.redis.enabled) return createHealthIndicatorResult(key, 'up', { configured: false });

    try {
      await this.redis.ping();
      return createHealthIndicatorResult(key, 'up', { configured: true });
    } catch (error) {
      throw new HealthCheckError(
        'Redis health check failed',
        createHealthIndicatorResult(key, 'down', {
          configured: true,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
}
