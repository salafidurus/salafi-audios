import { Controller, Get, Param, Query } from '@nestjs/common';
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

  @Get('kibar')
  @ApiOperation({ summary: 'Get Kibar ul-Ulama recommendations' })
  @ApiOkResponse({ type: RecommendationPageDto })
  kibar(
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listKibar(query.limit, query.cursor);
  }

  @Get('topics/:slug')
  @ApiOperation({ summary: 'Get topic recommendations by slug' })
  @ApiOkResponse({ type: RecommendationPageDto })
  topic(
    @Param('slug') slug: string,
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    return this.recommendations.listTopic(slug, query.limit, query.cursor);
  }
}
