import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { TopicDetailDto } from './dto/topic-detail.dto';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { TopicsService } from './topics.service';
import { TopicViewDto } from '../lecture-topics/dto/topic-view.dto';
import { TopicLectureViewDto } from './dto/topic-lecture-view.dto';

@SkipThrottle()
@ApiTags('Topics')
@ApiCommonErrors()
@Controller('topics')
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'List topics' })
  @ApiOkResponse({ type: [TopicDetailDto] })
  list(): Promise<TopicDetailDto[]> {
    return this.topics.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get topic by slug' })
  @ApiOkResponse({ type: TopicDetailDto })
  getBySlug(@Param('slug') slug: string): Promise<TopicDetailDto> {
    return this.topics.getBySlug(slug);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Upsert topic by slug' })
  @ApiOkResponse({ type: TopicDetailDto })
  upsert(@Body() dto: UpsertTopicDto): Promise<TopicDetailDto> {
    return this.topics.upsert(dto);
  }

  @Get(':slug/children')
  @ApiOperation({ summary: 'List direct children of a topic' })
  @ApiOkResponse({ type: [TopicViewDto] })
  listChildren(@Param('slug') slug: string): Promise<TopicViewDto[]> {
    return this.topics.listChildren(slug);
  }

  @Get(':slug/lectures')
  @ApiOperation({ summary: 'List published lectures tagged with this topic' })
  @ApiOkResponse({ type: [TopicLectureViewDto] })
  listLectures(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ): Promise<TopicLectureViewDto[]> {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.topics.listLectures(slug, parsedLimit);
  }
}
