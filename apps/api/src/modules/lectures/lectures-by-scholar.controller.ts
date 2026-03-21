import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { LecturesService } from './lectures.service';
import type { LectureViewDto } from '@sd/core-contracts';
import { Public } from '../../modules/auth/decorators';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';

@ApiTags('Lectures')
@ApiCommonErrors()
@Public()
@Controller('scholars/:scholarSlug/lectures')
export class LecturesByScholarController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  @ApiOperation({
    summary: 'List published lectures for a scholar (paginated)',
  })
  @ApiOkResponse({ description: 'List of published lectures for the scholar' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return (default: 20)',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Cursor for pagination',
  })
  listByScholar(
    @Param('scholarSlug') scholarSlug: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ): Promise<LectureViewDto[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.lectures.listPublishedByScholarSlugPaginated(
      scholarSlug,
      parsedLimit,
      cursor,
    );
  }
}
