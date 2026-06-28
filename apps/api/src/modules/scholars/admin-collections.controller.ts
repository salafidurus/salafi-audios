import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminCollectionListItemDto,
  AdminCollectionDetailDto,
  BulkActionDto,
  BulkActionResultDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsService } from './scholars.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@ApiTags('Admin Collections')
@ApiCommonErrors()
@Controller('admin/collections')
@UseGuards(AdminPermissionGuard)
export class AdminCollectionsController {
  constructor(private readonly service: ScholarsService) {}

  @Get()
  @RequiresPermission('manage:content')
  @ApiOperation({
    summary: 'List collections (optionally filtered by scholarId)',
  })
  list(@Query('scholarId') scholarId?: string): Promise<AdminCollectionListItemDto[]> {
    return this.service.listAdminCollections(scholarId ?? '');
  }

  @Get(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Get collection detail' })
  detail(@Param('id') id: string): Promise<AdminCollectionDetailDto> {
    return this.service.getAdminCollectionDetail(id);
  }

  @Post()
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Create a collection' })
  create(@Body() dto: CreateCollectionDto) {
    return this.service.createCollection(dto);
  }

  @Patch(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Update a collection' })
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.service.updateCollection(id, dto);
  }

  @Post(':id/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a collection' })
  publish(@Param('id') id: string) {
    return this.service.publishCollection(id);
  }

  @Post(':id/archive')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Archive a collection' })
  archive(@Param('id') id: string) {
    return this.service.archiveCollection(id);
  }

  @Post('bulk')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Bulk publish or archive collections' })
  bulk(@Body() dto: BulkActionDto): Promise<BulkActionResultDto> {
    return this.service.bulkCollectionAction(dto);
  }
}
