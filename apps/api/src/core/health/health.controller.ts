import { PrismaService } from '@/shared/db/prisma.service';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthDbResponseDto } from './dto/health-db.dto';
import { HealthResponseDto, HealthStatus } from './dto/health.dto';

@SkipThrottle()
@ApiTags('Health')
@ApiCommonErrors()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth(): HealthResponseDto {
    return {
      status: HealthStatus.OK,
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME ?? undefined,
      environment: process.env.NODE_ENV ?? undefined,
    };
  }

  @Get('db')
  @ApiOkResponse({ type: HealthDbResponseDto })
  async getDbHealth(): Promise<HealthDbResponseDto> {
    try {
      // Try to reconnect if connection is closed
      await this.prisma.$connect();

      // simplest + fastest: SELECT 1
      await this.prisma.$queryRawUnsafe('SELECT 1');

      return {
        status: 'ok',
        provider: 'postgresql',
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Attempt to reconnect
      await this.prisma.$disconnect();
      await this.prisma.$connect();

      // Retry the query
      await this.prisma.$queryRawUnsafe('SELECT 1');

      return {
        status: 'ok',
        provider: 'postgresql',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
