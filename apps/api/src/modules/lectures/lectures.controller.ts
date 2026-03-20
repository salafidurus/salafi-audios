import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../modules/auth/decorators';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { LecturesService } from './lectures.service';
import type { LectureViewDto } from '@sd/contracts';

@SkipThrottle()
@ApiTags('Lectures')
@ApiCommonErrors()
@Public()
@Controller('scholars/:scholarSlug/lectures')
export class LecturesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  @ApiOperation({ summary: 'List published lectures for a scholar' })
  @ApiOkResponse({ description: 'List of published lectures' })
  list(@Param('scholarSlug') scholarSlug: string): Promise<LectureViewDto[]> {
    return this.lectures.listPublished(scholarSlug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published lecture by slug' })
  @ApiOkResponse({ description: 'Published lecture details' })
  get(
    @Param('scholarSlug') scholarSlug: string,
    @Param('slug') slug: string,
  ): Promise<LectureViewDto> {
    return this.lectures.getPublished(scholarSlug, slug);
  }
}
