import { Injectable } from '@nestjs/common';
import { AnalyticsDbService } from '../db/analytics-db.service';
import {
  createHealthIndicatorResult,
  HealthCheckError,
  type HealthIndicatorResult,
} from './health.service';

/** NestJS analytics database health indicator coordinating the API boundary for this responsibility. */
@Injectable()
/** core API analytics-db-health indicator module providing analytics connectivity diagnostics. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AnalyticsDbHealthIndicator {
  constructor(private readonly db: AnalyticsDbService) {}

  /** Pings the analytics Prisma client without sharing the primary database result. */
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return createHealthIndicatorResult(key, 'up', { databaseRole: 'analytics' });
    } catch (error) {
      throw new HealthCheckError(
        'Analytics database check failed',
        createHealthIndicatorResult(key, 'down', {
          databaseRole: 'analytics',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    }
  }
}
