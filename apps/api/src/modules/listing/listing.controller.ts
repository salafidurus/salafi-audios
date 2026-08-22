import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public, CurrentUser } from '../../core/auth/decorators';
import { ListingService } from './listing.service';
import type {
  ListingDetailDto,
  RelatedListingDto,
  ListingContentsDto,
  LastPlayedLessonDto,
  ListingProgressSummaryDto,
  FeedPageDto,
} from '@sd/core-contracts';
import { SkipThrottle } from '@nestjs/throttler';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';

@SkipThrottle()
@ApiTags('Listings')
@ApiCommonErrors()
@Public()
@Controller('listings')
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
@CacheTTL(24 * 60 * 60 * 1000) // 24 hours; successful mutations clear the cache
export class ListingController {
  constructor(private readonly service: ListingService) {}

  @Get('recent')
  @CacheTTL(3 * 60 * 60 * 1000) // Recent feed changes more often than catalog details
  @ApiOperation({ summary: 'Get recent top-level listings' })
  @ApiOkResponse({ description: 'Paginated recent listings feed (single, series, collection)' })
  async getRecentListings(
    @Query('cursor') cursor?: string,
    @Query('limit') limitStr?: string,
  ): Promise<FeedPageDto> {
    const limit = Math.min(Math.max(Number(limitStr) || 20, 1), 40);
    return this.service.getRecentListings(cursor, limit);
  }

  @Get('promotions')
  @CacheTTL(24 * 60 * 60 * 1000)
  @ApiOperation({ summary: 'Get home promotions (featured hero and editors picks)' })
  @ApiOkResponse({ description: 'Promotional metadata for home screen' })
  async getPromotions(): Promise<any> {
    return this.service.getPromotions();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get listing detail by public slug' })
  @ApiOkResponse({
    description: 'Listing detail with scholar, topics, audio, and series context',
  })
  getBySlug(@Param('slug') slug: string): Promise<ListingDetailDto> {
    return this.service.getBySlug(slug);
  }

  @Get(':slug/contents')
  @ApiOperation({ summary: 'Get contents tree for a listing by public slug' })
  @ApiOkResponse({
    description: 'Flat or sectioned content tree for single, series, or collection',
  })
  getContents(@Param('slug') slug: string): Promise<ListingContentsDto> {
    return this.service.getContents(slug);
  }

  @Get(':slug/last-played')
  @ApiOperation({ summary: 'Get last played lesson in series or collection for user' })
  @ApiOkResponse({
    description: 'Last played lesson progress or null',
  })
  getLastPlayedLesson(
    @Param('slug') slug: string,
    @CurrentUser() user?: { id: string },
  ): Promise<LastPlayedLessonDto | null> {
    if (!user?.id) return Promise.resolve(null);
    return this.service.getLastPlayedLesson(slug, user.id);
  }

  @Get(':slug/progress-summary')
  @ApiOperation({ summary: "Get a user's progress rollup across a listing's playable leaves" })
  @ApiOkResponse({
    description: 'Total/completed leaf counts, percent complete, and completion state',
  })
  getProgressSummary(
    @Param('slug') slug: string,
    @CurrentUser() user?: { id: string },
  ): Promise<ListingProgressSummaryDto | null> {
    if (!user?.id) return Promise.resolve(null);
    return this.service.getProgressSummary(slug, user.id);
  }

  @Get(':slug/related')
  @ApiOperation({ summary: 'Get related listings' })
  @ApiOkResponse({
    description: 'Related listings based on scholar, topics, and series',
  })
  getRelated(@Param('slug') slug: string): Promise<RelatedListingDto[]> {
    return this.service.getRelated(slug);
  }
}
