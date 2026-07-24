import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { Permissions } from '@sd/core-contracts';
import { RequiresPermission } from '../../core/auth/decorators';
import type { AudioAssetViewDto } from '@sd/core-contracts';
import { AudioAssetsService } from './audio-assets.service';

interface AddAudioAssetDto {
  audioKey: string;
  durationSeconds?: number;
  sizeBytes?: number;
  format?: string;
}

@Controller('admin/listings/:listingId/audio-assets')
export class AdminAudioAssetsController {
  constructor(private service: AudioAssetsService) {}

  @Get()
  @RequiresPermission(Permissions.LISTINGS_VIEW)
  async listAssets(@Param('listingId') listingId: string): Promise<AudioAssetViewDto[]> {
    return this.service.listByListing(listingId);
  }

  @Post()
  @RequiresPermission(Permissions.LISTINGS_EDIT)
  async addAsset(
    @Param('listingId') listingId: string,
    @Body() dto: AddAudioAssetDto,
  ): Promise<AudioAssetViewDto> {
    return this.service.addAsset(listingId, dto);
  }

  @Post(':assetId/promote')
  @RequiresPermission(Permissions.LISTINGS_EDIT)
  async promoteAsset(
    @Param('listingId') listingId: string,
    @Param('assetId') assetId: string,
  ): Promise<void> {
    return this.service.promoteAsset(listingId, assetId);
  }

  @Delete(':assetId')
  @RequiresPermission(Permissions.LISTINGS_EDIT)
  async deleteAsset(
    @Param('listingId') listingId: string,
    @Param('assetId') assetId: string,
  ): Promise<void> {
    return this.service.deleteAsset(listingId, assetId);
  }
}
