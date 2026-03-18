import {
  ScholarDetailDto,
  ScholarStatsDto,
  ScholarViewDto,
} from '@sd/contracts';
import { Public } from '@/modules/auth/decorators';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecommendationListQueryDto } from '../recommendations/dto/recommendation-list.query.dto';
import { RecommendationPageDto } from '../recommendations/dto/recommendation-page.dto';
import { RecommendationsRepository } from '../recommendations/recommendations.repo';
import { ScholarService } from './scholars.service';

@ApiTags('Scholars')
@ApiCommonErrors()
@Public()
@Controller('scholars')
export class ScholarsController {
  constructor(
    private readonly scholars: ScholarService,
    private readonly recommendations: RecommendationsRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List active scholars' })
  @ApiOkResponse({ description: 'List of active scholars' })
  list(): Promise<ScholarViewDto[]> {
    return this.scholars.listActiveScholars();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an active scholar by slug' })
  @ApiOkResponse({ description: 'Scholar details' })
  getBySlug(@Param('slug') slug: string): Promise<ScholarDetailDto> {
    return this.scholars.getActiveScholarBySlug(slug);
  }

  @Get(':slug/stats')
  @ApiOperation({
    summary: 'Get scholar statistics (series, lectures, followers)',
  })
  @ApiOkResponse({ description: 'Scholar statistics' })
  getStats(@Param('slug') slug: string): Promise<ScholarStatsDto> {
    return this.scholars.getScholarStats(slug);
  }

  @Get(':slug/popular')
  @ApiOperation({
    summary:
      'Get popular lessons for a scholar (collections, standalone series, standalone lectures)',
  })
  @ApiOkResponse({ type: RecommendationPageDto })
  async popular(
    @Param('slug') slug: string,
    @Query() query: RecommendationListQueryDto,
  ): Promise<RecommendationPageDto> {
    const scholar = await this.scholars.getActiveScholarBySlug(slug);
    return this.recommendations.listPopularForScholar(
      scholar.id,
      query.windowDays,
      query.limit,
      query.cursor,
    );
  }
}
