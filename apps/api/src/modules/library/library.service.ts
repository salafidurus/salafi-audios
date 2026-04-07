import { Injectable } from '@nestjs/common';
import type { LibraryPageDto } from '@sd/core-contracts';
import { LibraryRepository } from './library.repo';

@Injectable()
export class LibraryService {
  constructor(private readonly repo: LibraryRepository) {}

  async getInProgress(
    userId: string,
    cursor?: string,
  ): Promise<LibraryPageDto> {
    const { items, nextCursor } = await this.repo.findInProgress(
      userId,
      cursor,
    );
    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async getCompleted(userId: string, cursor?: string): Promise<LibraryPageDto> {
    const { items, nextCursor } = await this.repo.findCompleted(userId, cursor);
    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async getSaved(userId: string, cursor?: string): Promise<LibraryPageDto> {
    const { items, nextCursor } = await this.repo.findSaved(userId, cursor);
    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async saveLecture(userId: string, lectureId: string): Promise<void> {
    await this.repo.saveLecture(userId, lectureId);
  }

  async unsaveLecture(userId: string, lectureId: string): Promise<void> {
    await this.repo.unsaveLecture(userId, lectureId);
  }

  async bulkSave(userId: string, lectureIds: string[]): Promise<void> {
    await this.repo.bulkSave(userId, lectureIds);
  }
}
