import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScholarService } from './scholars.service';
import { UpsertScholarDto } from './dto/upsert-scholar.dto';
import { ScholarViewDto } from './dto/scholar-view.dto';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { ScholarDetailDto } from './dto/scholar-detail.dto';

@ApiTags('Scholars')
@ApiCommonErrors()
@Controller('scholars')
export class ScholarsController {
  constructor(private readonly scholars: ScholarService) {}

  @Get()
  @ApiOperation({ summary: 'List active scholars' })
  @ApiOkResponse({ type: [ScholarViewDto] })
  list(): Promise<ScholarViewDto[]> {
    return this.scholars.listActiveScholars();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an active scholar by slug' })
  @ApiOkResponse({ type: ScholarViewDto })
  getBySlug(@Param('slug') slug: string): Promise<ScholarDetailDto> {
    return this.scholars.getActiveScholarBySlug(slug);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Upsert scholar by slug' })
  @ApiOkResponse({ type: ScholarViewDto })
  upsert(@Body() dto: UpsertScholarDto): Promise<ScholarDetailDto> {
    return this.scholars.upsertScholar(dto);
  }
}
