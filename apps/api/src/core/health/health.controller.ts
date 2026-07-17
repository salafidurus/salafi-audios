import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import type { HealthCheckResult } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { PrismaHealthIndicator } from './prisma-health.indicator';

@SkipThrottle()
@ApiTags('Health')
@ApiCommonErrors()
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly cdnHealth: CDNHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Full system health (database + CDN)' })
  @ApiOkResponse({ description: 'Health check result' })
  @HealthCheck()
  getHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', { timeout: 1000 }),
      () => this.cdnHealth.pingCheck('cdn', { timeout: 5000 }),
    ]);
  }

  @Get('healthz')
  @ApiOperation({ summary: 'Liveness probe – is the service running?' })
  @ApiOkResponse({ description: 'Always ok if the process is alive' })
  @HealthCheck()
  getLiveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('readyz')
  @ApiOperation({ summary: 'Readiness probe – can the service accept traffic?' })
  @ApiOkResponse({ description: 'Ok when core dependencies (database) are available' })
  @HealthCheck()
  getReadiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.prismaHealth.pingCheck('database', { timeout: 1000 })]);
  }
}
