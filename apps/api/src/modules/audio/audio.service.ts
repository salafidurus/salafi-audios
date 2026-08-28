import { Injectable, NotFoundException } from '@nestjs/common';
import type { ProgressSyncItemDto, AudioProgressDto, StreamResponseDto } from '@sd/core-contracts';
import { AudioRepository } from './audio.repo';

/** NestJS audio service service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** audio application module responsible for audio.service behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AudioService {
  constructor(private readonly repo: AudioRepository) {}

  async getUserProgress(userId: string, since?: string): Promise<AudioProgressDto[]> {
    const sinceDate = since ? new Date(since) : undefined;
    return this.repo.getUserProgress(userId, sinceDate);
  }

  async upsertProgress(
    userId: string,
    slug: string,
    positionSeconds: number,
    durationSeconds?: number,
    isCompleted?: boolean,
  ): Promise<void> {
    const found = await this.repo.upsertProgress(
      userId,
      slug,
      positionSeconds,
      durationSeconds,
      isCompleted,
    );
    if (!found) {
      throw new NotFoundException(`Listing ${slug} not found`);
    }
  }

  async bulkSync(userId: string, items: ProgressSyncItemDto[]): Promise<void> {
    await this.repo.bulkSync(userId, items);
  }

  async resolveStreamUrl(slug: string): Promise<StreamResponseDto> {
    const listing = await this.repo.findListingBySlug(slug);

    if (!listing) {
      throw new NotFoundException(`Listing "${slug}" not found`);
    }

    // Use the resolved internal id from here on — the route identity was a slug.
    let asset = await this.repo.findPrimaryAsset(listing.id);

    if (!asset) {
      asset = await this.repo.findFirstAsset(listing.id);
    }

    if (!asset) {
      throw new NotFoundException(`No audio assets found for listing ${listing.id}`);
    }

    return {
      url: asset.url,
      durationSeconds: asset.durationSeconds || listing.durationSeconds || 0,
      format: asset.format ?? 'mp3',
    };
  }
}
