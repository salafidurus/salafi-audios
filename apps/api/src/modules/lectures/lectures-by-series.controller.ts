import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../modules/auth/decorators';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { LecturesService } from './lectures.service';
import type { LectureViewDto } from '@sd/core-contracts';

@SkipThrottle()
@ApiTags('Lectures')
@ApiCommonErrors()
@Public()
@Controller('scholars/:scholarSlug/series/:seriesSlug/lectures')
export class LecturesBySeriesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  @ApiOperation({
    summary:
      'List published lectures for a given series (scoped by scholar + series)',
  })
  @ApiOkResponse({ description: 'List of published lectures for the series' })
  listForSeries(
    @Param('scholarSlug') scholarSlug: string,
    @Param('seriesSlug') seriesSlug: string,
  ): Promise<LectureViewDto[]> {
    return this.lectures.listPublishedForSeries(scholarSlug, seriesSlug);
  }
}
