import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AttachTopicDto } from './dto/attach-topic.dto';
import { LectureTopicViewDto } from './dto/lecture-topic-view.dto';
import { LectureTopicsService } from './lecture-topics.service';

@SkipThrottle()
@ApiTags('Lecture Topics')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/lectures/:lectureSlug/topics')
export class LectureTopicsController {
  constructor(private readonly topics: LectureTopicsService) {}

  @Get()
  @ApiOperation({ summary: 'List topics attached to a lecture' })
  @ApiOkResponse({ type: [LectureTopicViewDto] })
  list(
    @Param('scholarSlug') scholarSlug: string,
    @Param('lectureSlug') lectureSlug: string,
  ): Promise<LectureTopicViewDto[]> {
    return this.topics.list(scholarSlug, lectureSlug);
  }

  @Post()
  @ApiOperation({ summary: 'Attach a topic to a lecture (idempotent)' })
  @ApiOkResponse({ type: LectureTopicViewDto })
  attach(
    @Param('scholarSlug') scholarSlug: string,
    @Param('lectureSlug') lectureSlug: string,
    @Body() dto: AttachTopicDto,
  ): Promise<LectureTopicViewDto> {
    return this.topics.attach(scholarSlug, lectureSlug, dto.topicSlug);
  }

  @Delete(':topicSlug')
  @ApiOperation({ summary: 'Detach a topic from a lecture (idempotent)' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  detach(
    @Param('scholarSlug') scholarSlug: string,
    @Param('lectureSlug') lectureSlug: string,
    @Param('topicSlug') topicSlug: string,
  ): Promise<{ ok: true }> {
    return this.topics.detach(scholarSlug, lectureSlug, topicSlug);
  }
}
