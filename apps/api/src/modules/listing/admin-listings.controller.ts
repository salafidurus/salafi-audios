import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminListingActionDto,
  AdminListingUpdateDto,
  AdminListingListDto,
  AdminListingDetailDto,
  BulkActionResultDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { BulkActionDto } from '../../shared/dto/bulk-action.dto';

@ApiTags('Admin Listings')
@ApiCommonErrors()
@Controller('admin/listings')
@UseGuards(AdminPermissionGuard)
export class AdminListingsController {
  constructor(private readonly service: ListingService) {}

  @Get()
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'List all listings (admin)' })
  listAdmin(
    @Query('page') page = '1',
    @Query('scholarId') scholarId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<AdminListingListDto> {
    return this.service.listAdmin({
      page: Number(page),
      scholarId,
      status,
      search,
    });
  }

  @Get(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Get listing detail (admin)' })
  getAdminDetail(@Param('id') id: string): Promise<AdminListingDetailDto> {
    return this.service.getAdminDetail(id);
  }

  @Post()
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Create a listing after R2 upload' })
  createListing(
    @Body() dto: CreateListingDto,
    @Req() req: { user?: { id: string } },
  ): Promise<{ id: string; title: string }> {
    const publicUrl = dto.audioKey
      ? `${process.env['R2_PUBLIC_BASE_URL']}/${dto.audioKey}`
      : undefined;
    return this.service.createListing({ ...dto, publicUrl }, req.user?.id);
  }

  @Post('bulk')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Bulk publish or archive listings' })
  bulkAction(@Body() dto: BulkActionDto): Promise<BulkActionResultDto> {
    return this.service.bulkAction(dto);
  }

  @Put(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Update listing metadata' })
  @ApiOkResponse({ description: 'Listing updated successfully' })
  async updateListing(
    @Param('id') id: string,
    @Body() updateDto: AdminListingUpdateDto,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.service.updateListing(id, updateDto, req.user?.id);
    return { ...res, message: 'Listing updated successfully' };
  }

  @Post(':id/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a listing' })
  @ApiOkResponse({ description: 'Listing published successfully' })
  async publishListing(@Param('id') id: string): Promise<AdminListingActionDto> {
    const res = await this.service.publishListing(id);
    return { ...res, message: 'Listing published successfully' };
  }

  @Post(':id/archive')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Archive a listing' })
  @ApiOkResponse({ description: 'Listing archived successfully' })
  async archiveListing(@Param('id') id: string): Promise<AdminListingActionDto> {
    const res = await this.service.archiveListing(id);
    return { ...res, message: 'Listing archived successfully' };
  }
}
