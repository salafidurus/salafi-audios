import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../core/auth/decorators';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarDetailStats,
  ScholarContentUnifiedDto,
  ScholarTopicsDto,
} from '@sd/core-contracts';
import { ScholarsService } from './scholars.service';

/** NestJS scholars controller service or controller coordinating the API boundary for this responsibility. */
@SkipThrottle()
@ApiTags('Scholars')
@ApiCommonErrors()
@Public()
@Controller('scholars')
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor) // Cache control must wrap cache interceptor to capture cache hits
@CacheTTL(24 * 60 * 60 * 1000) // 24 hours; successful mutations clear the cache
/** scholars application module responsible for scholars.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ScholarsController {
  constructor(private readonly scholars: ScholarsService) {}

  @Get()
  @ApiOperation({ summary: 'List active scholars' })
  @ApiOkResponse({ description: 'List of active scholars with lecture counts' })
  list(): Promise<{ scholars: ScholarListItemDto[] }> {
    return this.scholars.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get scholar detail by slug' })
  @ApiOkResponse({ description: 'Scholar detail with stats' })
  getBySlug(@Param('slug') slug: string): Promise<ScholarDetailDto & ScholarDetailStats> {
    return this.scholars.getBySlug(slug);
  }

  @Get(':slug/content')
  @ApiOperation({ summary: "Get scholar's published content" })
  @ApiOkResponse({
    description: 'Unified ranked list of content items (collections, series, singles)',
  })
  getContent(@Param('slug') slug: string): Promise<ScholarContentUnifiedDto> {
    return this.scholars.getContent(slug);
  }

  @Get(':slug/topics')
  @ApiOperation({ summary: "Get scholar's published content grouped by topic" })
  @ApiOkResponse({
    description: 'Scholar content grouped by topic',
  })
  getTopics(@Param('slug') slug: string): Promise<ScholarTopicsDto> {
    return this.scholars.getTopics(slug);
  }
}
