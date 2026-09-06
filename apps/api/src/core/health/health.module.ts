import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DbHealthIndicator } from './db-health.indicator';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { RedisHealthIndicator } from './redis-health.indicator';
import { HealthService } from './health.service';
import { RedisModule } from '../redis/redis.module';
import { DbModule } from '../db/db.module';
import { AnalyticsDbHealthIndicator } from './analytics-db-health.indicator';

/** Core API health.module module providing shared backend infrastructure and authority-boundary services. */
@Module({
  imports: [RedisModule, DbModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    DbHealthIndicator,
    AnalyticsDbHealthIndicator,
    CDNHealthIndicator,
    RedisHealthIndicator,
  ],
})
/** NestJS health module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class HealthModule {}
