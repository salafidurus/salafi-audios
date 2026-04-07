import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../modules/auth/decorators';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { LiveService } from './live.service';

@SkipThrottle()
@ApiTags('Live')
@ApiCommonErrors()
@Public()
@Controller('live')
export class LiveController {
  constructor(private readonly service: LiveService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active live sessions with delta fetching' })
  getActive(@Query('since') since?: string) {
    return this.service.getActive(since);
  }

  @Get('upcoming')
  @ApiOperation({
    summary: 'Get upcoming scheduled sessions with delta fetching',
  })
  getUpcoming(@Query('since') since?: string) {
    return this.service.getUpcoming(since);
  }

  @Get('ended')
  @ApiOperation({ summary: 'Get recently ended sessions with delta fetching' })
  getEnded(@Query('since') since?: string) {
    return this.service.getEnded(since);
  }
}
