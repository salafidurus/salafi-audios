import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { LecturesService } from './lectures.service';
import { LectureViewDto } from './dto/lecture-view.dto';

@SkipThrottle()
@ApiTags('Lectures')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/series/:seriesSlug/lectures')
export class LecturesBySeriesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  @ApiOperation({
    summary:
      'List published lectures for a given series (scoped by scholar + series)',
  })
  @ApiOkResponse({ type: [LectureViewDto] })
  listForSeries(
    @Param('scholarSlug') scholarSlug: string,
    @Param('seriesSlug') seriesSlug: string,
  ): Promise<LectureViewDto[]> {
    return this.lectures.listPublishedForSeries(scholarSlug, seriesSlug);
  }
}
