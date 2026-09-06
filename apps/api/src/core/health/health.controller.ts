import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../auth/decorators';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RateLimitPolicy } from '../security/rate-limit.decorator';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { DbHealthIndicator } from './db-health.indicator';
import { RedisHealthIndicator } from './redis-health.indicator';
import { HealthService, type HealthCheckResult } from './health.service';
import { RedisService } from '../redis/redis.service';
import { AnalyticsDbHealthIndicator } from './analytics-db-health.indicator';

/** NestJS health controller service or controller coordinating the API boundary for this responsibility. */
@RateLimitPolicy('health-probe')
@ApiTags('Health')
@ApiCommonErrors()
@Public()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
/** Core API health.controller module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class HealthController {
  constructor(
    private readonly health: HealthService,
    private readonly dbHealth: DbHealthIndicator,
    private readonly cdnHealth: CDNHealthIndicator,
    private readonly redis: RedisService,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly analyticsDbHealth: AnalyticsDbHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Full system health (database + CDN)' })
  @ApiOkResponse({ description: 'Health check result' })
  getHealth(): Promise<HealthCheckResult> {
    const checks = [
      () => this.dbHealth.pingCheck('database', { timeout: 5000 }),
      () => this.analyticsDbHealth.pingCheck('analyticsDatabase'),
      () => this.cdnHealth.pingCheck('cdn', { timeout: 5000 }),
    ];
    if (this.redis.enabled) checks.push(() => this.redisHealth.pingCheck('redis'));
    return this.health.check(checks);
  }

  @Get('healthz')
  @ApiOperation({ summary: 'Liveness probe – is the service running?' })
  @ApiOkResponse({ description: 'Always ok if the process is alive' })
  getLiveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('readyz')
  @ApiOperation({ summary: 'Readiness probe – can the service accept traffic?' })
  @ApiOkResponse({ description: 'Ok when core dependencies (database) are available' })
  getReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.dbHealth.pingCheck('database', { timeout: 5000 }),
      () => this.analyticsDbHealth.pingCheck('analyticsDatabase'),
    ]);
  }
}
