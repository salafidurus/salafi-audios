import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AttachTopicDto } from '../lecture-topics/dto/attach-topic.dto';
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

  @Post()
  @ApiOperation({ summary: 'Attach a topic to a series (idempotent)' })
  @ApiOkResponse({ type: LectureTopicViewDto })
  attach(
    @Param('scholarSlug') scholarSlug: string,
    @Param('seriesSlug') seriesSlug: string,
    @Body() dto: AttachTopicDto,
  ): Promise<LectureTopicViewDto> {
    return this.topics.attach(scholarSlug, seriesSlug, dto.topicSlug);
  }

  @Delete(':topicSlug')
  @ApiOperation({ summary: 'Detach a topic from a series (idempotent)' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  detach(
    @Param('scholarSlug') scholarSlug: string,
    @Param('seriesSlug') seriesSlug: string,
    @Param('topicSlug') topicSlug: string,
  ): Promise<{ ok: true }> {
    return this.topics.detach(scholarSlug, seriesSlug, topicSlug);
  }
}
