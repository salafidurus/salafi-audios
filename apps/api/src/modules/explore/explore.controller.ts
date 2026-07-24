import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../core/auth/decorators';
import { ExploreService } from './explore.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';

@SkipThrottle()
@ApiTags('Explore')
@ApiCommonErrors()
@Controller('explore')
export class ExploreController {
  constructor(private readonly explore: ExploreService) {}

  @Get()
  @Public()
  @UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
  @CacheTTL(5 * 60 * 1000) // 5 minutes cache
  @ApiOperation({ summary: 'Get ranked content feed' })
  @ApiOkResponse({ description: 'Paginated feed items' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'topicSlugs',
    required: false,
    type: String,
    description: 'Comma-separated topic slugs',
  })
  @ApiQuery({
    name: 'scholarSlugs',
    required: false,
    type: String,
    description: 'Comma-separated scholar slugs',
  })
  getExplore(
    @Query('cursor') cursor?: string,
    @Query('limit') limitStr?: string,
    @Query('topicSlugs') topicSlugs?: string,
    @Query('scholarSlugs') scholarSlugs?: string,
  ) {
    const limit = Math.min(Math.max(Number(limitStr) || 20, 1), 40);
    const topics = topicSlugs ? topicSlugs.split(',').map((s) => s.trim()) : undefined;
    const scholars = scholarSlugs ? scholarSlugs.split(',').map((s) => s.trim()) : undefined;

    return this.explore.getExplore(cursor, limit, topics, scholars);
  }

  @Get('recent')
  @Public()
  @UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
  @CacheTTL(5 * 60 * 1000) // 5 minutes cache
  @ApiOperation({ summary: 'Get recent content feed sorted by creation date' })
  @ApiOkResponse({ description: 'Paginated recent feed items' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getExploreRecent(@Query('cursor') cursor?: string, @Query('limit') limitStr?: string) {
    const limit = Math.min(Math.max(Number(limitStr) || 20, 1), 40);
    return this.explore.getExploreRecent(cursor, limit);
  }

  @Get('following')
  @ApiOperation({
    summary: 'Get following feed for authenticated users',
  })
  @ApiOkResponse({ description: 'Paginated following feed items' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getFollowingExplore(@Query('cursor') cursor?: string, @Query('limit') limitStr?: string) {
    const limit = Math.min(Math.max(Number(limitStr) || 20, 1), 40);
    return this.explore.getFollowingExplore(cursor, limit);
  }

  @Get('scholars')
  @Public()
  @UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
  @CacheTTL(5 * 60 * 1000) // 5 minutes cache
  @ApiOperation({ summary: 'Get ranked scholars for feed' })
  @ApiOkResponse({ description: 'Top scholars for horizontal section' })
  getScholars() {
    return this.explore.getScholars();
  }
}
