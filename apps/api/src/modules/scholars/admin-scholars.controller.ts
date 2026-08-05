import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { resolveScholarIdParam } from '../../core/auth/policy-resolvers';
import { ScholarsService } from './scholars.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Controller('admin/scholars')
export class AdminScholarsController {
  constructor(private readonly service: ScholarsService) {}

  @Get()
  @ApiOperation({ summary: 'List all scholars (including inactive)' })
  list(@Query('cursor') cursor: string | undefined, @Query('search') search: string | undefined) {
    return this.service.adminList(cursor, search, undefined);
  }

  @Get(':id/form-data')
  @CheckPolicy('write', 'Scholar', resolveScholarIdParam())
  @ApiOperation({ summary: 'Get scholar with translations for edit form' })
  getFormData(@Param('id') id: string) {
    return this.service.getFormData(id);
  }

  @Post()
  @CheckPolicy('write', 'Scholar')
  @ApiOperation({ summary: 'Create a scholar' })
  create(@Body() dto: CreateScholarDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @CheckPolicy('write', 'Scholar', resolveScholarIdParam())
  @ApiOperation({ summary: 'Update a scholar' })
  update(@Param('id') id: string, @Body() dto: UpdateScholarDto) {
    return this.service.update(id, dto);
  }
}
