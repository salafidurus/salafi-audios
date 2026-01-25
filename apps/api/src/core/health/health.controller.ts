import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto, HealthStatus } from './dto/health.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
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
}
