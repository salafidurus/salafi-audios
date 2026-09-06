import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { getAuth } from '../../core/auth/auth.instance';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../core/auth/decorators';
import { RateLimitPolicy } from '../../core/security/rate-limit.decorator';
import { AnalyticsService } from './analytics.service';
import {
  IngestAnalyticsEventsDtoSchema,
  type IngestAnalyticsEventsDto,
} from './dto/ingest-analytics-events.dto';

/** NestJS analytics controller service or controller coordinating the API boundary for this responsibility. */
@Controller({ path: 'analytics', version: '1' })
@ApiCommonErrors()
@RateLimitPolicy('analytics-ingest')
@Public()
/** analytics application module responsible for analytics.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('events')
  async ingest(
    @Body({ schema: IngestAnalyticsEventsDtoSchema }) body: IngestAnalyticsEventsDto,
    @Req() request: Request,
  ) {
    const hasCredentials = Boolean(request.headers.authorization || request.headers.cookie);
    const session = await getAuth().api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (hasCredentials && !session) {
      throw new UnauthorizedException({ code: 'analytics_invalid_session' });
    }
    return this.analytics.ingest(body.events, session?.user.id);
  }
}
