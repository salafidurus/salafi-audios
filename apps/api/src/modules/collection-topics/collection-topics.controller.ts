import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AttachTopicDto } from '../lecture-topics/dto/attach-topic.dto';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';
import { CollectionTopicsService } from './collection-topics.service';

@SkipThrottle()
@ApiTags('Collection Topics')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/collections/:collectionSlug/topics')
export class CollectionTopicsController {
  constructor(private readonly topics: CollectionTopicsService) {}

  @Get()
  @ApiOperation({ summary: 'List topics attached to a collection' })
  @ApiOkResponse({ type: [LectureTopicViewDto] })
  list(
    @Param('scholarSlug') scholarSlug: string,
    @Param('collectionSlug') collectionSlug: string,
  ): Promise<LectureTopicViewDto[]> {
    return this.topics.list(scholarSlug, collectionSlug);
  }

  @Post()
  @ApiOperation({ summary: 'Attach a topic to a collection (idempotent)' })
  @ApiOkResponse({ type: LectureTopicViewDto })
  attach(
    @Param('scholarSlug') scholarSlug: string,
    @Param('collectionSlug') collectionSlug: string,
    @Body() dto: AttachTopicDto,
  ): Promise<LectureTopicViewDto> {
    return this.topics.attach(scholarSlug, collectionSlug, dto.topicSlug);
  }

  @Delete(':topicSlug')
  @ApiOperation({ summary: 'Detach a topic from a collection (idempotent)' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  detach(
    @Param('scholarSlug') scholarSlug: string,
    @Param('collectionSlug') collectionSlug: string,
    @Param('topicSlug') topicSlug: string,
  ): Promise<{ ok: true }> {
    return this.topics.detach(scholarSlug, collectionSlug, topicSlug);
  }
}
