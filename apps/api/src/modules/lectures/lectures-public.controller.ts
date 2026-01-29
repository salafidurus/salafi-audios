import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { LecturesService } from './lectures.service';
import { LectureViewDto } from './dto/lecture-view.dto';

@SkipThrottle()
@ApiTags('Lectures')
@ApiCommonErrors()
@Controller('lectures')
export class LecturesPublicController {
  constructor(private readonly lectures: LecturesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a published lecture by id' })
  @ApiOkResponse({ type: LectureViewDto })
  getById(@Param('id') id: string): Promise<LectureViewDto> {
    return this.lectures.getPublishedById(id);
  }
}
