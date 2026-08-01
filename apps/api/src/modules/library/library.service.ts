import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  LibraryPageDto,
  RecentProgressDto,
  SavedDeltaItemDto,
  SavedSyncItemDto,
} from '@sd/core-contracts';
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

  async getSavedDelta(userId: string, since?: string): Promise<SavedDeltaItemDto[]> {
    return this.repo.findSavedDelta(userId, since ? new Date(since) : undefined);
  }

  async getRecentProgress(userId: string): Promise<RecentProgressDto | null> {
    return this.repo.getRecentProgress(userId);
  }

  async saveListing(userId: string, listingId: string): Promise<void> {
    const found = await this.repo.saveLecture(userId, listingId);
    if (!found) {
      throw new NotFoundException(`Listing ${listingId} not found`);
    }
  }

  async unsaveListing(userId: string, listingId: string): Promise<void> {
    const found = await this.repo.unsaveLecture(userId, listingId);
    if (!found) {
      throw new NotFoundException(`Listing ${listingId} not found`);
    }
  }

  async bulkSyncSaved(userId: string, items: SavedSyncItemDto[]): Promise<void> {
    await this.repo.bulkSync(userId, items);
  }
}
