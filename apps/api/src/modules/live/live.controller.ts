import { Controller, Get, Query, Param, Sse } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Observable, merge, interval, map } from 'rxjs';
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

  @Sse('stream')
  @ApiOperation({ summary: 'Subscribe to real-time livestream events' })
  stream(): Observable<MessageEvent> {
    const heartbeat$ = interval(15000).pipe(
      map(() => ({ data: { type: 'heartbeat' } }) as MessageEvent),
    );

    const updates$ = this.service.updates$.pipe(
      map(
        (session) =>
          ({
            data: { type: 'session_update', session },
          }) as MessageEvent,
      ),
    );

    return merge(heartbeat$, updates$);
  }

  @Get('channels')
  @ApiOperation({ summary: 'Get all active livestream channels' })
  getChannels() {
    return this.service.getChannels();
  }

  @Get('channels/:slug')
  @ApiOperation({ summary: 'Get livestream channel by slug' })
  getChannelBySlug(@Param('slug') slug: string) {
    return this.service.getChannelBySlug(slug);
  }

  @Get('sessions/active')
  @ApiOperation({ summary: 'Get active live sessions with delta fetching' })
  getActiveSessions(@Query('since') since?: string) {
    return this.service.getActive(since);
  }

  @Get('sessions/upcoming')
  @ApiOperation({
    summary: 'Get upcoming scheduled sessions with delta fetching',
  })
  getUpcomingSessions(@Query('since') since?: string) {
    return this.service.getUpcoming(since);
  }

  // Keep backward compatibility with old endpoints
  @Get('active')
  @ApiOperation({
    summary: 'Get active live sessions with delta fetching (deprecated)',
  })
  getActive(@Query('since') since?: string) {
    return this.service.getActive(since);
  }

  @Get('upcoming')
  @ApiOperation({
    summary: 'Get upcoming scheduled sessions with delta fetching (deprecated)',
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
