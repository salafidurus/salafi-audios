import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { SeriesService } from './series.service';
import { SeriesViewDto } from './dto/series-view.dto';

@SkipThrottle()
@ApiTags('Series')
@ApiCommonErrors()
@Controller('series')
export class SeriesPublicController {
  constructor(private readonly series: SeriesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a published series by id' })
  @ApiOkResponse({ type: SeriesViewDto })
  getById(@Param('id') id: string): Promise<SeriesViewDto> {
    return this.series.getPublishedById(id);
  }
}
