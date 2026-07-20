import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';
import type { TopicDetailDto, TopicLectureViewDto } from '@sd/core-contracts';
import { TopicsService } from './topics.service';

@SkipThrottle()
@ApiTags('Topics')
@ApiCommonErrors()
@Public()
@Controller('topics')
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor) // Cache control must wrap cache interceptor to capture cache hits
@CacheTTL(10 * 60 * 1000) // 10 minutes cache (topics change infrequently)
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
