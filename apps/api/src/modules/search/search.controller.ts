import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../core/auth/decorators';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import {
  SearchQueryDtoSchema,
  type SearchCatalogResultsDto as CatalogSearchResultsContractDto,
} from '@sd/core-contracts';
import { SearchService } from './search.service';
import type { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultsDto } from './dto/search-results.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';

/** NestJS search controller service or controller coordinating the API boundary for this responsibility. */
@SkipThrottle()
@ApiTags('Search')
@ApiCommonErrors()
@Public()
@Controller('search')
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
@CacheTTL(15 * 60 * 1000) // Search results change with catalog mutations; writes clear cache
/** search application module responsible for search.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search catalog across collections, series, and lectures',
  })
  @ApiOkResponse({ type: SearchResultsDto })
  search(
    @Query({ schema: SearchQueryDtoSchema }) query: SearchQueryDto,
  ): Promise<CatalogSearchResultsContractDto> {
    return this.searchService.search(query);
  }

  @Get('extended')
  @ApiOperation({
    summary:
      'Search catalog including scholar names and topic matches for collections, series, and lectures',
  })
  @ApiOkResponse({ type: SearchResultsDto })
  searchExtended(
    @Query({ schema: SearchQueryDtoSchema }) query: SearchQueryDto,
  ): Promise<CatalogSearchResultsContractDto> {
    return this.searchService.searchExtended(query);
  }
}
