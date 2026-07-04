import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarContentUnifiedDto,
  ScholarTopicsDto,
} from '@sd/core-contracts';
import { ScholarsService } from './scholars.service';

@SkipThrottle()
@ApiTags('Scholars')
@ApiCommonErrors()
@Public()
@Controller('scholars')
export class ScholarsController {
  constructor(private readonly scholars: ScholarsService) {}

  @Get()
  @ApiOperation({ summary: 'List active scholars' })
  @ApiOkResponse({ description: 'List of active scholars with lecture counts' })
  list(): Promise<{ scholars: ScholarListItemDto[] }> {
    return this.scholars.list();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get scholar detail by slug' })
  @ApiOkResponse({ description: 'Scholar detail with stats' })
  getBySlug(@Param('slug') slug: string): Promise<
    ScholarDetailDto & {
      lectureCount: number;
      seriesCount: number;
      totalDurationSeconds: number;
    }
  > {
    return this.scholars.getBySlug(slug);
  }

  @Get(':slug/content')
  @ApiOperation({ summary: "Get scholar's published content" })
  @ApiOkResponse({
    description: 'Unified ranked list of content items (collections, series, singles)',
  })
  getContent(@Param('slug') slug: string): Promise<ScholarContentUnifiedDto> {
    return this.scholars.getContent(slug);
  }

  @Get(':slug/topics')
  @ApiOperation({ summary: "Get scholar's published content grouped by topic" })
  @ApiOkResponse({
    description: 'Scholar content grouped by topic',
  })
  getTopics(@Param('slug') slug: string): Promise<ScholarTopicsDto> {
    return this.scholars.getTopics(slug);
  }
}
