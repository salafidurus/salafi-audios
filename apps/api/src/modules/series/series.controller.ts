import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { SeriesService } from './series.service';
import { SeriesViewDto } from './dto/series-view.dto';

@SkipThrottle()
@ApiTags('Series')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/series')
export class SeriesController {
  constructor(private readonly series: SeriesService) {}

  @Get()
  @ApiOperation({ summary: 'List published series for a scholar' })
  @ApiOkResponse({ type: [SeriesViewDto] })
  list(@Param('scholarSlug') scholarSlug: string): Promise<SeriesViewDto[]> {
    return this.series.listPublished(scholarSlug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published series by slug' })
  @ApiOkResponse({ type: SeriesViewDto })
  get(
    @Param('scholarSlug') scholarSlug: string,
    @Param('slug') slug: string,
  ): Promise<SeriesViewDto> {
    return this.series.getPublished(scholarSlug, slug);
  }
}
