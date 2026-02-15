import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
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
}
