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
    lectureId: string,
    positionSeconds: number,
    durationSeconds?: number,
    isCompleted?: boolean,
  ): Promise<void> {
    await this.repo.upsertProgress(
      userId,
      lectureId,
      positionSeconds,
      durationSeconds,
      isCompleted,
    );
  }

  async bulkSync(userId: string, items: ProgressSyncItemDto[]): Promise<void> {
    await this.repo.bulkSync(userId, items);
  }

  async resolveStreamUrl(lectureId: string): Promise<StreamResponseDto> {
    // Check if the lecture exists
    const lecture = await this.repo.findLectureById(lectureId);

    if (!lecture) {
      throw new NotFoundException(`Lecture with ID ${lectureId} not found`);
    }

    // Try to find the primary audio asset
    let asset = await this.repo.findPrimaryAsset(lectureId);

    // Fallback to the first available audio asset
    if (!asset) {
      asset = await this.repo.findFirstAsset(lectureId);
    }

    if (!asset) {
      throw new NotFoundException(`No audio assets found for lecture ${lectureId}`);
    }

    return {
      url: asset.url,
      durationSeconds: asset.durationSeconds || lecture.durationSeconds || 0,
      format: asset.format,
    };
  }
}
