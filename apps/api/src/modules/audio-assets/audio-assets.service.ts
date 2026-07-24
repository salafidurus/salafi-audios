import { Injectable } from '@nestjs/common';
import { AudioAssetsRepository } from './audio-assets.repo';
import type { AudioAssetViewDto } from '@sd/core-contracts';

interface AddAudioAssetDto {
  audioKey: string;
  durationSeconds?: number;
  sizeBytes?: number;
  format?: string;
}

@Injectable()
export class AudioAssetsService {
  constructor(private repo: AudioAssetsRepository) {}

  async listByListing(listingId: string): Promise<AudioAssetViewDto[]> {
    return this.repo.listByListing(listingId);
  }

  async addAsset(listingId: string, dto: AddAudioAssetDto): Promise<AudioAssetViewDto> {
    return this.repo.add(listingId, dto);
  }

  async promoteAsset(listingId: string, assetId: string): Promise<void> {
    return this.repo.promote(listingId, assetId);
  }

  async deleteAsset(listingId: string, assetId: string): Promise<void> {
    return this.repo.delete(listingId, assetId);
  }
}
