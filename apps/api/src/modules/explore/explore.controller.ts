import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import type { FeedPageDto } from '@sd/core-contracts';
import { Public } from '../../core/auth/decorators';
import { RateLimitPolicy } from '../../core/security/rate-limit.decorator';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { ExploreService } from './explore.service';

/** Public Explore read boundary for recommendation-backed discovery pages. */
@RateLimitPolicy('public-read')
@ApiTags('Explore')
@ApiCommonErrors()
@Public()
@Controller({ path: 'explore', version: '1' })
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
@CacheTTL(3 * 60 * 60 * 1000)
/** Public HTTP adapter for the recommendation-backed Explore feed. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ExploreController {
  constructor(private readonly service: ExploreService) {}

  @Get()
  @ApiOperation({ summary: 'Get the Explore discovery feed' })
  @ApiOkResponse({ description: 'Versioned cursor-paginated Explore recommendation batches' })
  getRecommendations(
    @Query('cursor') cursor?: string,
    @Query('limit') limitStr?: string,
  ): Promise<FeedPageDto> {
    const limit = Math.min(Math.max(Number(limitStr) || 20, 1), 40);
    return this.service.getRecentRecommendations(cursor, limit);
  }
}
