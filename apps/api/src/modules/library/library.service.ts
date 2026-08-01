import { Injectable } from '@nestjs/common';
import type { LibraryPageDto, RecentProgressDto } from '@sd/core-contracts';
import { LibraryRepository } from './library.repo';

@Injectable()
export class LibraryService {
  constructor(private readonly repo: LibraryRepository) {}

  async getInProgress(userId: string, cursor?: string): Promise<LibraryPageDto> {
    const { items, nextCursor } = await this.repo.findInProgress(userId, cursor);
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

  async getRecentProgress(userId: string): Promise<RecentProgressDto | null> {
    return this.repo.getRecentProgress(userId);
  }

  async saveListing(userId: string, listingId: string): Promise<void> {
    await this.repo.saveLecture(userId, listingId);
  }

  async unsaveListing(userId: string, listingId: string): Promise<void> {
    await this.repo.unsaveLecture(userId, listingId);
  }

  async bulkSave(userId: string, listingIds: string[]): Promise<void> {
    await this.repo.bulkSave(userId, listingIds);
  }
}
