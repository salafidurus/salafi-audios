import { Injectable } from '@nestjs/common';
import type { ProgressSyncItemDto } from '@sd/core-contracts';
import { ProgressRepository } from './progress.repo';

@Injectable()
export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

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
}
