import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { LectureDetailDto } from '@sd/core-contracts';
import { LecturesService } from './lectures.service';

@SkipThrottle()
@ApiTags('Lectures')
@ApiCommonErrors()
@Public()
@Controller('lectures')
export class LecturesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lecture detail by ID' })
  @ApiOkResponse({
    description:
      'Lecture detail with scholar, topics, audio, and series context',
  })
  getById(@Param('id') id: string): Promise<LectureDetailDto> {
    return this.lectures.getById(id);
  }
}
