import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminSeriesListItemDto,
  AdminSeriesDetailDto,
  BulkActionDto,
  BulkActionResultDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsService } from './scholars.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

@ApiTags('Admin Series')
@ApiCommonErrors()
@Controller('admin/series')
@UseGuards(AdminPermissionGuard)
export class AdminSeriesController {
  constructor(private readonly service: ScholarsService) {}

  @Get()
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'List series (optionally filtered by scholarId)' })
  list(@Query('scholarId') scholarId?: string): Promise<AdminSeriesListItemDto[]> {
    return this.service.listAdminSeries(scholarId ?? '');
  }

  @Get(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Get series detail' })
  detail(@Param('id') id: string): Promise<AdminSeriesDetailDto> {
    return this.service.getAdminSeriesDetail(id);
  }

  @Post()
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Create a series' })
  create(@Body() dto: CreateSeriesDto) {
    return this.service.createSeries(dto);
  }

  @Patch(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Update a series' })
  update(@Param('id') id: string, @Body() dto: UpdateSeriesDto) {
    return this.service.updateSeries(id, dto);
  }

  @Post(':id/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a series' })
  publish(@Param('id') id: string) {
    return this.service.publishSeries(id);
  }

  @Post(':id/archive')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Archive a series' })
  archive(@Param('id') id: string) {
    return this.service.archiveSeries(id);
  }

  @Post('bulk')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Bulk publish or archive series' })
  bulk(@Body() dto: BulkActionDto): Promise<BulkActionResultDto> {
    return this.service.bulkSeriesAction(dto);
  }
}
