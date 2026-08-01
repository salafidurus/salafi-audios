import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../core/auth/decorators';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import type { SearchCatalogResultsDto as CatalogSearchResultsContractDto } from '@sd/core-contracts';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultsDto } from './dto/search-results.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';

@SkipThrottle()
@ApiTags('Search')
@ApiCommonErrors()
@Public()
@Controller('search')
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
@CacheTTL(5 * 60 * 1000) // 5 minutes cache
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search catalog across collections, series, and lectures',
  })
  @ApiOkResponse({ type: SearchResultsDto })
  search(@Query() query: SearchQueryDto): Promise<CatalogSearchResultsContractDto> {
    return this.searchService.search(query);
  }

  @Get('extended')
  @ApiOperation({
    summary:
      'Search catalog including scholar names and topic matches for collections, series, and lectures',
  })
  @ApiOkResponse({ type: SearchResultsDto })
  searchExtended(@Query() query: SearchQueryDto): Promise<CatalogSearchResultsContractDto> {
    return this.searchService.searchExtended(query);
  }
}
