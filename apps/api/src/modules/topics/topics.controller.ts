import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type {
  TopicDetailDto,
  TopicViewDto,
  TopicLectureViewDto,
} from '@sd/contracts';
import { TopicsService } from './topics.service';

@SkipThrottle()
@ApiTags('Topics')
@ApiCommonErrors()
@Public()
@Controller('topics')
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'List topics' })
  @ApiOkResponse({ description: 'List of topics with their details' })
  list(): Promise<TopicDetailDto[]> {
    return this.topics.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get topic by slug' })
  @ApiOkResponse({ description: 'Topic details' })
  getBySlug(@Param('slug') slug: string): Promise<TopicDetailDto> {
    return this.topics.getBySlug(slug);
  }

  @Get(':slug/children')
  @ApiOperation({ summary: 'List direct children of a topic' })
  @ApiOkResponse({ description: 'List of child topics' })
  listChildren(@Param('slug') slug: string): Promise<TopicViewDto[]> {
    return this.topics.listChildren(slug);
  }

  @Get(':slug/lectures')
  @ApiOperation({ summary: 'List published lectures tagged with this topic' })
  @ApiOkResponse({ description: 'List of lectures for this topic' })
  listLectures(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ): Promise<TopicLectureViewDto[]> {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.topics.listLectures(slug, parsedLimit);
  }
}
