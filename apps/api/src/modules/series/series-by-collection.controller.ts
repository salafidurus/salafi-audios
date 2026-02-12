import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { SeriesService } from './series.service';
import { SeriesViewDto } from './dto/series-view.dto';

@SkipThrottle()
@ApiTags('Series')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/collections/:collectionSlug/series')
export class SeriesByCollectionController {
  constructor(private readonly series: SeriesService) {}

  @Get()
  @ApiOperation({
    summary:
      'List published series for a given collection (scoped by scholar + collection)',
  })
  @ApiOkResponse({ type: [SeriesViewDto] })
  listForCollection(
    @Param('scholarSlug') scholarSlug: string,
    @Param('collectionSlug') collectionSlug: string,
  ): Promise<SeriesViewDto[]> {
    return this.series.listPublishedForCollection(scholarSlug, collectionSlug);
  }
}
