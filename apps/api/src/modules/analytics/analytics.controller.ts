import { Body, Controller, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';

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
}
