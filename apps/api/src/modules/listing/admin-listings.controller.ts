import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminListingActionDto,
  AdminListingUpdateDto,
  AdminListingListDto,
  AdminListingDetailDto,
  BulkActionResultDto,
  ListingRefDto,
} from '@sd/core-contracts';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../core/auth/decorators';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { BulkActionDto } from '../../shared/dto/bulk-action.dto';

@ApiTags('Admin Listings')
@ApiCommonErrors()
@Controller('admin/listings')
export class AdminListingsController {
  constructor(private readonly service: ListingService) {}

  @Get()
  @RequiresPermission(Permissions.LISTINGS_VIEW)
  @ApiOperation({ summary: 'List all listings (admin)' })
  listAdmin(
    @Query('cursor') cursor?: string,
    @Query('scholarId') scholarId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<AdminListingListDto> {
    return this.service.listAdmin({
      cursor,
      scholarId,
      status,
      search,
    });
  }

  @Get('series')
  @RequiresPermission(Permissions.LISTINGS_VIEW)
  @ApiOperation({ summary: 'Get series listings for a scholar (for picker dropdowns)' })
  @ApiOkResponse({ description: 'List of series-format listings' })
  async seriesOptions(@Query('scholarId') scholarId?: string): Promise<ListingRefDto[]> {
    if (!scholarId) {
      throw new BadRequestException('scholarId query parameter is required');
    }
    return this.service.getSeriesOptions(scholarId);
  }

  @Get(':id')
  @RequiresPermission(Permissions.LISTINGS_VIEW)
  @ApiOperation({ summary: 'Get listing detail (admin)' })
  getAdminDetail(@Param('id') id: string): Promise<AdminListingDetailDto> {
    return this.service.getAdminDetail(id);
  }

  @Get(':id/form-data')
  @RequiresPermission(Permissions.LISTINGS_EDIT)
  @ApiOperation({ summary: 'Get listing with translations for edit form' })
  getFormData(@Param('id') id: string) {
    return this.service.getFormData(id);
  }

  @Post()
  @RequiresPermission(Permissions.LISTINGS_CREATE)
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
  @RequiresPermission(Permissions.LISTINGS_PUBLISH)
  @ApiOperation({ summary: 'Bulk publish or archive listings' })
  bulkAction(@Body() dto: BulkActionDto): Promise<BulkActionResultDto> {
    return this.service.bulkAction(dto);
  }

  @Put(':id')
  @RequiresPermission(Permissions.LISTINGS_EDIT)
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
  @RequiresPermission(Permissions.LISTINGS_PUBLISH)
  @ApiOperation({ summary: 'Publish a listing' })
  @ApiOkResponse({ description: 'Listing published successfully' })
  async publishListing(@Param('id') id: string): Promise<AdminListingActionDto> {
    const res = await this.service.publishListing(id);
    return { ...res, message: 'Listing published successfully' };
  }

  @Post(':id/archive')
  @RequiresPermission(Permissions.LISTINGS_PUBLISH)
  @ApiOperation({ summary: 'Archive a listing' })
  @ApiOkResponse({ description: 'Listing archived successfully' })
  async archiveListing(@Param('id') id: string): Promise<AdminListingActionDto> {
    const res = await this.service.archiveListing(id);
    return { ...res, message: 'Listing archived successfully' };
  }
}
