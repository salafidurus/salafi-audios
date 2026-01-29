import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { CatalogService } from './catalog.service';
import { CatalogListQueryDto } from './dto/catalog-list.query.dto';
import { CatalogPageDto } from './dto/catalog-page.dto';
import { CollectionViewDto } from '../collections/dto/collection-view.dto';
import { SeriesViewDto } from '../series/dto/series-view.dto';
import { LectureViewDto } from '../lectures/dto/lecture-view.dto';

@SkipThrottle()
@ApiTags('Catalog')
@ApiCommonErrors()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('collections')
  @ApiOperation({ summary: 'Browse published collections (catalog root)' })
  @ApiOkResponse({ type: CatalogPageDto<CollectionViewDto> })
  collections(
    @Query() query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<CollectionViewDto>> {
    return this.catalog.listCollections(query);
  }

  @Get('series')
  @ApiOperation({
    summary: 'Browse published root series only (collectionId = null)',
  })
  @ApiOkResponse({ type: CatalogPageDto<SeriesViewDto> })
  series(
    @Query() query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<SeriesViewDto>> {
    return this.catalog.listRootSeries(query);
  }

  @Get('lectures')
  @ApiOperation({
    summary: 'Browse published root lectures only (seriesId = null)',
  })
  @ApiOkResponse({ type: CatalogPageDto<LectureViewDto> })
  lectures(
    @Query() query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<LectureViewDto>> {
    return this.catalog.listRootLectures(query);
  }
}
