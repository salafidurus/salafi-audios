import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { LecturesService } from './lectures.service';
import { LectureViewDto } from './dto/lecture-view.dto';

@SkipThrottle()
@ApiTags('Lectures')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/lectures')
export class LecturesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  @ApiOperation({ summary: 'List published lectures for a scholar' })
  @ApiOkResponse({ type: [LectureViewDto] })
  list(@Param('scholarSlug') scholarSlug: string): Promise<LectureViewDto[]> {
    return this.lectures.listPublished(scholarSlug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published lecture by slug' })
  @ApiOkResponse({ type: LectureViewDto })
  get(
    @Param('scholarSlug') scholarSlug: string,
    @Param('slug') slug: string,
  ): Promise<LectureViewDto> {
    return this.lectures.getPublished(scholarSlug, slug);
  }
}
