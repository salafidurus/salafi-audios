import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { RecommendationsService } from './recommendations.service';
import { RecommendationHeroItemDto } from './dto/recommendation-hero-item.dto';
import { RecommendationListQueryDto } from './dto/recommendation-list.query.dto';
import { RecommendationPageDto } from './dto/recommendation-page.dto';

@SkipThrottle()
@ApiTags('Recommendations')
@ApiCommonErrors()
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Get('hero')
  @ApiOperation({ summary: 'Get hero recommendations (max 3)' })
  @ApiOkResponse({ type: RecommendationHeroItemDto, isArray: true })
  hero(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationHeroItemDto[]> {
    return this.recommendations.listHero(query.limit);
  }

  @Get('recommended/kibar')
  @ApiOperation({ summary: 'Get recommended Kibar ul-Ulama items' })
  @ApiOkResponse({ type: RecommendationPageDto })
  kibar(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listRecommendedKibar(query.limit, query.cursor);
  }

  @Get('recommended/recent-play')
  @ApiOperation({ summary: 'Get recommended items from recent plays' })
  @ApiOkResponse({ type: RecommendationPageDto })
  recentPlay(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listRecommendedRecentPlay(
      query.limit,
      query.cursor,
    );
  }

  @Get('recommended/topics')
  @ApiOperation({ summary: 'Get recommended items for topics' })
  @ApiOkResponse({ type: RecommendationPageDto })
  recommendedTopics(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listRecommendedTopics(
      query.topics,
      query.limit,
      query.cursor,
    );
  }

  @Get('following/scholars')
  @ApiOperation({ summary: 'Get recommendations from followed scholars' })
  @ApiOkResponse({ type: RecommendationPageDto })
  followingScholars(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listFollowingScholars(
      query.limit,
      query.cursor,
    );
  }

  @Get('following/topics')
  @ApiOperation({ summary: 'Get recommendations from followed topics' })
  @ApiOkResponse({ type: RecommendationPageDto })
  followingTopics(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listFollowingTopics(
      query.topics,
      query.limit,
      query.cursor,
    );
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest recommendations' })
  @ApiOkResponse({ type: RecommendationPageDto })
  latest(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listLatest(query.limit, query.cursor);
  }

  @Get('latest/topics')
  @ApiOperation({ summary: 'Get latest recommendations by topic' })
  @ApiOkResponse({ type: RecommendationPageDto })
  latestTopics(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listLatestTopics(
      query.topics,
      query.limit,
      query.cursor,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular recommendations (analytics) ' })
  @ApiOkResponse({ type: RecommendationPageDto })
  popular(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listPopular(
      query.windowDays,
      query.limit,
      query.cursor,
    );
  }

  @Get('popular/topics')
  @ApiOperation({ summary: 'Get popular recommendations by topic (analytics)' })
  @ApiOkResponse({ type: RecommendationPageDto })
  popularTopics(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listPopularTopics(
      query.topics,
      query.windowDays,
      query.limit,
      query.cursor,
    );
  }
}
