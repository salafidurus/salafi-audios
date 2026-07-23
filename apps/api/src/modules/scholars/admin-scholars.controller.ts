import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { ScholarsService } from './scholars.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Controller('admin/scholars')
export class AdminScholarsController {
  constructor(private readonly service: ScholarsService) {}

  @Get()
  @RequiresPermission(Permissions.SCHOLARS_VIEW)
  @ApiOperation({ summary: 'List all scholars (including inactive)' })
  list(@Query('cursor') cursor?: string) {
    return this.service.adminList(cursor);
  }

  @Get(':id/form-data')
  @RequiresPermission(Permissions.SCHOLARS_EDIT)
  @ApiOperation({ summary: 'Get scholar with translations for edit form' })
  getFormData(@Param('id') id: string) {
    return this.service.getFormData(id);
  }

  @Post()
  @RequiresPermission(Permissions.SCHOLARS_CREATE)
  @ApiOperation({ summary: 'Create a scholar' })
  create(@Body() dto: CreateScholarDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequiresPermission(Permissions.SCHOLARS_EDIT)
  @ApiOperation({ summary: 'Update a scholar' })
  update(@Param('id') id: string, @Body() dto: UpdateScholarDto) {
    return this.service.update(id, dto);
  }
}
