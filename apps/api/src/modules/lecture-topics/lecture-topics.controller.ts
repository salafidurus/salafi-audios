import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
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
}
