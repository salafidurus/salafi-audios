import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DbHealthIndicator } from './db-health.indicator';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { RedisHealthIndicator } from './redis-health.indicator';
import { RedisModule } from '../redis/redis.module';

/** Core API health.module module providing shared backend infrastructure and authority-boundary services. */
@Module({
  imports: [TerminusModule, RedisModule],
  controllers: [HealthController],
  providers: [DbHealthIndicator, CDNHealthIndicator, RedisHealthIndicator],
})
/** NestJS health module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class HealthModule {}
