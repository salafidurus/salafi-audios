import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
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
  AdminListingListDto,
  AdminListingDetailDto,
  AdminListingMediaDetailDto,
  AdminArrangeDataDto,
  ArrangeCommitResultDto,
  BulkActionResultDto,
  ListingRefDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { CurrentUser } from '../../core/auth/decorators';
import {
  resolveListingScholarId,
  resolveScholarIdFromBody,
} from '../../core/auth/policy-resolvers';
import { defineAbilityFor } from '../../core/auth/ability/ability.factory';
import type { AbilityInput } from '../../core/auth/ability/ability.types';
import { subject } from '@casl/ability';
import { PrismaService } from '../../core/db/prisma.service';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDetailsDto } from './dto/update-listing-details.dto';
import { UpdateListingMediaDto } from './dto/update-listing-media.dto';
import { ArrangeCommitDto } from './dto/arrange-commit.dto';
import { BulkActionDto } from '../../shared/dto/bulk-action.dto';

@ApiTags('Admin Listings')
@ApiCommonErrors()
@Controller('admin/listings')
export class AdminListingsController {
  constructor(
    private readonly service: ListingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all listings (admin)' })
  listAdmin(
    @Query('cursor') cursor: string | undefined,
    @Query('scholarId') scholarId: string | undefined,
    @Query('status') status: string | undefined,
    @Query('search') search: string | undefined,
  ): Promise<AdminListingListDto> {
    return this.service.listAdmin({
      cursor,
      scholarId,
      status,
      search,
      accessibleScholarIds: undefined,
    });
  }

  @Get('series')
  @ApiOperation({ summary: 'Get series listings for a scholar (for picker dropdowns)' })
  @ApiOkResponse({ description: 'List of series-format listings' })
  async seriesOptions(@Query('scholarId') scholarId?: string): Promise<ListingRefDto[]> {
    if (!scholarId) {
      throw new BadRequestException('scholarId query parameter is required');
    }
    return this.service.getSeriesOptions(scholarId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing detail (admin)' })
  getAdminDetail(@Param('id') id: string): Promise<AdminListingDetailDto> {
    return this.service.getAdminDetail(id);
  }

  @Get(':id/form-data')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Get listing with translations for edit form' })
  getFormData(@Param('id') id: string) {
    return this.service.getFormData(id);
  }

  @Get(':id/media-data')
  @ApiOperation({ summary: 'Get listing media details' })
  getMediaData(@Param('id') id: string): Promise<AdminListingMediaDetailDto> {
    return this.service.getMediaData(id);
  }

  @Get(':id/arrange-data')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Get listing children tree for the upload & arrange flow' })
  getArrangeData(@Param('id') id: string): Promise<AdminArrangeDataDto> {
    return this.service.getArrangeData(id);
  }

  @Post(':id/arrange-commit')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Transactionally create/update modules and lessons with audio' })
  arrangeCommit(
    @Param('id') id: string,
    @Body() dto: ArrangeCommitDto,
    @Req() req: { user?: { id: string } },
  ): Promise<ArrangeCommitResultDto> {
    return this.service.arrangeCommit(id, dto, req.user?.id);
  }

  @Post()
  @CheckPolicy('write', 'Listing', resolveScholarIdFromBody())
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
  @CheckPolicy('publish', 'Listing')
  @ApiOperation({ summary: 'Bulk publish or archive listings' })
  async bulkAction(
    @Body() dto: BulkActionDto,
    @CurrentUser() user: AbilityInput,
  ): Promise<BulkActionResultDto> {
    // The decorator above only confirms the caller has SOME publish/archive
    // capability. Bulk targets multiple listings that may belong to
    // different scholars, so each row is checked individually here — the
    // whole batch is rejected if any row is out of the caller's scope,
    // rather than silently applying to a subset.
    const ability = defineAbilityFor(user);
    const rows = await this.prisma.listing.findMany({
      where: { id: { in: dto.ids } },
      select: { id: true, scholar: { select: { slug: true } } },
    });
    const action = dto.action === 'archive' ? 'archive' : 'publish';
    for (const row of rows) {
      if (!ability.can(action, subject('Listing', { scholarSlug: row.scholar.slug } as never))) {
        throw new ForbiddenException(
          `Missing capability: ${action} Listing (scholarSlug: ${row.scholar.slug})`,
        );
      }
    }
    return this.service.bulkAction(dto);
  }

  @Put(':id/details')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Update listing details (title, description, status, topics, etc.)' })
  @ApiOkResponse({ description: 'Listing details updated successfully' })
  async updateListingDetails(
    @Param('id') id: string,
    @Body() updateDto: UpdateListingDetailsDto,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.service.updateListingDetails(id, updateDto, req.user?.id);
    return { ...res, message: 'Listing details updated successfully' };
  }

  @Put(':id/media')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Update listing media (audio file, duration, etc.)' })
  @ApiOkResponse({ description: 'Listing media updated successfully' })
  async updateListingMedia(
    @Param('id') id: string,
    @Body() updateDto: UpdateListingMediaDto,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.service.updateListingMedia(id, updateDto, req.user?.id);
    return { ...res, message: 'Listing media updated successfully' };
  }

  @Post(':id/publish')
  @CheckPolicy('publish', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Publish a listing' })
  @ApiOkResponse({ description: 'Listing published successfully' })
  async publishListing(@Param('id') id: string): Promise<AdminListingActionDto> {
    const res = await this.service.publishListing(id);
    return { ...res, message: 'Listing published successfully' };
  }

  @Post(':id/archive')
  @CheckPolicy('delete', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Archive a listing' })
  @ApiOkResponse({ description: 'Listing archived successfully' })
  async archiveListing(@Param('id') id: string): Promise<AdminListingActionDto> {
    const res = await this.service.archiveListing(id);
    return { ...res, message: 'Listing archived successfully' };
  }
}
