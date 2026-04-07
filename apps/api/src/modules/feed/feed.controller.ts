import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { FeedService } from './feed.service';

@SkipThrottle()
@ApiTags('Feed')
@ApiCommonErrors()
@Public()
@Controller('feed')
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  @ApiOperation({ summary: 'Get ranked content feed' })
  @ApiOkResponse({ description: 'Paginated feed items' })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'topicSlugs',
    required: false,
    type: String,
    description: 'Comma-separated topic slugs',
  })
  @ApiQuery({
    name: 'scholarSlugs',
    required: false,
    type: String,
    description: 'Comma-separated scholar slugs',
  })
  getFeed(
    @Query('cursor') cursor?: string,
    @Query('limit') limitStr?: string,
    @Query('topicSlugs') topicSlugs?: string,
    @Query('scholarSlugs') scholarSlugs?: string,
  ) {
    const limit = Math.min(Math.max(Number(limitStr) || 20, 1), 40);
    const topics = topicSlugs
      ? topicSlugs.split(',').map((s) => s.trim())
      : undefined;
    const scholars = scholarSlugs
      ? scholarSlugs.split(',').map((s) => s.trim())
      : undefined;

    return this.feed.getFeed(cursor, limit, topics, scholars);
  }

  @Get('scholars')
  @ApiOperation({ summary: 'Get ranked scholars for feed' })
  @ApiOkResponse({ description: 'Top scholars for horizontal section' })
  getScholars() {
    return this.feed.getScholars();
  }
}
