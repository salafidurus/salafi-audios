import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../core/auth/decorators';
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RateLimitPolicy } from '../../core/security/rate-limit.decorator';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';
import type { TopicDetailDto, TopicLectureViewDto } from '@sd/core-contracts';
import { TopicsService } from './topics.service';

/** NestJS topics controller service or controller coordinating the API boundary for this responsibility. */
@RateLimitPolicy('public-read')
@ApiTags('Topics')
@ApiCommonErrors()
@Public()
@Controller({ path: 'topics', version: '1' })
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor) // Cache control must wrap cache interceptor to capture cache hits
@CacheTTL(24 * 60 * 60 * 1000) // 24 hours; successful mutations clear the cache
/** topics application module responsible for topics.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'List topics' })
  @ApiOkResponse({ description: 'List of topics with their details' })
  list(): Promise<TopicDetailDto[]> {
    return this.topics.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get topic by slug' })
  @ApiOkResponse({ description: 'Topic details' })
  getBySlug(@Param('slug') slug: string): Promise<TopicDetailDto> {
    return this.topics.getBySlug(slug);
  }

  @Get(':slug/lectures')
  @ApiOperation({ summary: 'List published lectures tagged with this topic' })
  @ApiOkResponse({ description: 'List of lectures for this topic' })
  listLectures(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ): Promise<TopicLectureViewDto[]> {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.topics.listLectures(slug, parsedLimit);
  }
}
