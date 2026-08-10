import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DbHealthIndicator } from './db-health.indicator';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { RedisHealthIndicator } from './redis-health.indicator';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TerminusModule, RedisModule],
  controllers: [HealthController],
  providers: [DbHealthIndicator, CDNHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
