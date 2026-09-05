import {
  ArrangeCommitDtoSchema,
  BulkActionDtoSchema,
  CreateListingDtoSchema,
  UpdateListingDetailsDtoSchema,
  UpdateListingMediaDtoSchema,
  type ArrangeCommitDto,
  type BulkActionDto,
  type CreateListingDto,
  type UpdateListingDetailsDto,
  type UpdateListingMediaDto,
  type AdminListingActionDto,
  type AdminListingListDto,
  type AdminListingDetailDto,
  type AdminListingMediaDetailDto,
  type AdminArrangeDataDto,
  type ArrangeCommitResultDto,
  type BulkActionResultDto,
  type ListingRefDto,
  type HomePromotionsDto,
} from '@sd/core-contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { ListingEditorialService } from './listing-editorial.service';
import { RateLimitPolicy } from '../../core/security/rate-limit.decorator';

/** NestJS admin listings controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Admin Listings')
@ApiCommonErrors()
@Controller({ path: 'admin/listings', version: '1' })
/** listing application module responsible for admin listings.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AdminListingsController {
  constructor(
    private readonly service: ListingService,
    private readonly editorial: ListingEditorialService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('promotions')
  @CheckPolicy('write', 'Listing')
  @ApiOperation({ summary: 'Get current home promotions (admin)' })
  @ApiOkResponse({ description: 'Current promotions metadata' })
  async getPromotions(): Promise<HomePromotionsDto> {
    return this.service.getPromotions();
  }

  @Post('promotions')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Listing')
  @ApiOperation({ summary: 'Update home promotions' })
  @ApiOkResponse({ description: 'Success status' })
  async updatePromotions(@Body() body: any): Promise<any> {
    return this.service.updatePromotions(body);
  }

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
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Transactionally create/update modules and lessons with audio' })
  arrangeCommit(
    @Param('id') id: string,
    @Body({ schema: ArrangeCommitDtoSchema }) dto: ArrangeCommitDto,
    @Req() req: { user?: { id: string } },
  ): Promise<ArrangeCommitResultDto> {
    return this.editorial.arrange(id, dto, req.user?.id);
  }

  @Post()
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Listing', resolveScholarIdFromBody())
  @ApiOperation({ summary: 'Create a listing after R2 upload' })
  createListing(
    @Body({ schema: CreateListingDtoSchema }) dto: CreateListingDto,
    @Req() req: { user?: { id: string } },
  ): Promise<{ id: string; title: string }> {
    const publicUrl = dto.audioKey
      ? `${process.env['R2_PUBLIC_BASE_URL']}/${dto.audioKey}`
      : undefined;
    return this.service.createListing({ ...dto, publicUrl }, req.user?.id);
  }

  @Post('bulk')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('publish', 'Listing')
  @ApiOperation({ summary: 'Bulk publish or archive listings' })
  async bulkAction(
    @Body({ schema: BulkActionDtoSchema }) dto: BulkActionDto,
    @CurrentUser() user: AbilityInput,
    @Req() req: { user?: { id: string } },
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
      // SAFETY: `subject()` needs a concrete resource instance so CASL evaluates
      // scholar-scoped conditions; the object literal exactly matches that shape.
      if (!ability.can(action, subject('Listing', { scholarSlug: row.scholar.slug } as never))) {
        throw new ForbiddenException(
          `Missing capability: ${action} Listing (scholarSlug: ${row.scholar.slug})`,
        );
      }
    }
    return this.editorial.bulkStatus(dto, req.user?.id);
  }

  @Put(':id/details')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Update listing details (title, description, status, topics, etc.)' })
  @ApiOkResponse({ description: 'Listing details updated successfully' })
  async updateListingDetails(
    @Param('id') id: string,
    @Body({ schema: UpdateListingDetailsDtoSchema }) updateDto: UpdateListingDetailsDto,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.service.updateListingDetails(id, updateDto, req.user?.id);
    return { ...res, message: 'Listing details updated successfully' };
  }

  @Put(':id/media')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Update listing media (audio file, duration, etc.)' })
  @ApiOkResponse({ description: 'Listing media updated successfully' })
  async updateListingMedia(
    @Param('id') id: string,
    @Body({ schema: UpdateListingMediaDtoSchema }) updateDto: UpdateListingMediaDto,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.editorial.replace(id, updateDto, req.user?.id);
    return { ...res, message: 'Listing media updated successfully' };
  }

  @Post(':id/publish')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('publish', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Publish a listing' })
  @ApiOkResponse({ description: 'Listing published successfully' })
  async publishListing(
    @Param('id') id: string,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.editorial.publish(id, req.user?.id);
    return { ...res, message: 'Listing published successfully' };
  }

  @Post(':id/archive')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('delete', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Archive a listing' })
  @ApiOkResponse({ description: 'Listing archived successfully' })
  async archiveListing(
    @Param('id') id: string,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.editorial.archive(id, req.user?.id);
    return { ...res, message: 'Listing archived successfully' };
  }

  @Delete(':id')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('delete', 'Listing', resolveListingScholarId())
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiOkResponse({ description: 'Listing deleted successfully' })
  async deleteListing(
    @Param('id') id: string,
    @Req() req: { user?: { id: string } },
  ): Promise<AdminListingActionDto> {
    const res = await this.editorial.remove(id, req.user?.id);
    return { ...res, message: 'Listing deleted successfully' };
  }
}
