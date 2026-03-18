import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@/modules/auth/decorators';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { LecturesService } from './lectures.service';
import type { LectureViewDto } from '@sd/contracts';

@SkipThrottle()
@ApiTags('Lectures')
@ApiCommonErrors()
@Public()
@Controller('lectures')
export class LecturesPublicController {
  constructor(private readonly lectures: LecturesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a published lecture by id' })
  @ApiOkResponse({ description: 'The published lecture details' })
  getById(@Param('id') id: string): Promise<LectureViewDto> {
    return this.lectures.getPublishedById(id);
  }
}
