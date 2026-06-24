import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { R2HealthIndicator } from './r2-health.indicator';

@SkipThrottle()
@ApiTags('Health')
@ApiCommonErrors()
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly r2Health: R2HealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check (full)' })
  @ApiOkResponse({ description: 'Health check result' })
  @HealthCheck()
  getHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', { timeout: 300 }),
      () => this.r2Health.pingCheck('storage', { timeout: 300 }),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiOkResponse({ description: 'Liveness check result' })
  @HealthCheck()
  getLive(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiOkResponse({ description: 'Readiness check result' })
  @HealthCheck()
  getReady(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', { timeout: 300 }),
      () => this.r2Health.pingCheck('storage', { timeout: 300 }),
    ]);
  }
}
