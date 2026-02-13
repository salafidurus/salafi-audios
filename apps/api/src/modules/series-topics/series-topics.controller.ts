import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';
import { SeriesTopicsService } from './series-topics.service';

@SkipThrottle()
@ApiTags('Series Topics')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/series/:seriesSlug/topics')
export class SeriesTopicsController {
  constructor(private readonly topics: SeriesTopicsService) {}

  @Get()
  @ApiOperation({ summary: 'List topics attached to a series' })
  @ApiOkResponse({ type: [LectureTopicViewDto] })
  list(
    @Param('scholarSlug') scholarSlug: string,
    @Param('seriesSlug') seriesSlug: string,
  ): Promise<LectureTopicViewDto[]> {
    return this.topics.list(scholarSlug, seriesSlug);
  }
}
