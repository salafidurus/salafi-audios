import { Injectable, NotFoundException } from '@nestjs/common';
import type { ProgressSyncItemDto, AudioProgressDto, StreamResponseDto } from '@sd/core-contracts';
import { AudioRepository } from './audio.repo';

@Injectable()
export class AudioService {
  constructor(private readonly repo: AudioRepository) {}

  async getUserProgress(userId: string, since?: string): Promise<AudioProgressDto[]> {
    const sinceDate = since ? new Date(since) : undefined;
    return this.repo.getUserProgress(userId, sinceDate);
  }

  async upsertProgress(
    userId: string,
    listingId: string,
    positionSeconds: number,
    durationSeconds?: number,
    isCompleted?: boolean,
  ): Promise<void> {
    await this.repo.upsertProgress(
      userId,
      listingId,
      positionSeconds,
      durationSeconds,
      isCompleted,
    );
  }

  async bulkSync(userId: string, items: ProgressSyncItemDto[]): Promise<void> {
    await this.repo.bulkSync(userId, items);
  }

  async resolveStreamUrl(listingId: string): Promise<StreamResponseDto> {
    const listing = await this.repo.findListingById(listingId);

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${listingId} not found`);
    }

    let asset = await this.repo.findPrimaryAsset(listingId);

    if (!asset) {
      asset = await this.repo.findFirstAsset(listingId);
    }

    if (!asset) {
      throw new NotFoundException(`No audio assets found for listing ${listingId}`);
    }

    return {
      url: asset.url,
      durationSeconds: asset.durationSeconds || listing.durationSeconds || 0,
      format: asset.format ?? 'mp3',
    };
  }
}
