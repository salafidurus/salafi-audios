import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@/modules/auth/decorators';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import type { SearchCatalogResultsDto as CatalogSearchResultsContractDto } from '@sd/contracts';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultsDto } from './dto/search-results.dto';

@SkipThrottle()
@ApiTags('Search')
@ApiCommonErrors()
@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search catalog across collections, series, and lectures',
  })
  @ApiOkResponse({ type: SearchResultsDto })
  search(
    @Query() query: SearchQueryDto,
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
    @Query() query: SearchQueryDto,
  ): Promise<CatalogSearchResultsContractDto> {
    return this.searchService.searchExtended(query);
  }
}
