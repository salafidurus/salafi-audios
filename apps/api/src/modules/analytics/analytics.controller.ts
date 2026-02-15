import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';
import { PlatformStatsDto } from './dto/platform-stats.dto';

@SkipThrottle()
@ApiTags('Analytics')
@ApiCommonErrors()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('events')
  @ApiOperation({ summary: 'Record an analytics event' })
  @ApiNoContentResponse()
  async record(@Body() body: CreateAnalyticsEventDto): Promise<void> {
    await this.analytics.recordEvent(body);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Platform analytics statistics' })
  @ApiOkResponse({ type: PlatformStatsDto })
  async stats(): Promise<PlatformStatsDto> {
    return this.analytics.getPlatformStats();
  }
}
