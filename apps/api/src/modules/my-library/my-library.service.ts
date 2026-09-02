/** my library application module responsible for my library.service behavior at the backend boundary. */
/** my library application module responsible for my library.service behavior at the backend boundary. */
import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  MyLibraryPageDto,
  RecentProgressDto,
  SavedDeltaItemDto,
  SavedSyncItemDto,
} from '@sd/core-contracts';
import { MyLibraryRepository } from './my-library.repo';

/** NestJS my library service service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** my-library application module responsible for my library.service behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class MyLibraryService {
  constructor(private readonly repo: MyLibraryRepository) {}

  async getInProgress(userId: string, cursor?: string): Promise<MyLibraryPageDto> {
    const { items, nextCursor } = await this.repo.findInProgress(userId, cursor);
    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async getCompleted(userId: string, cursor?: string): Promise<MyLibraryPageDto> {
    const { items, nextCursor } = await this.repo.findCompleted(userId, cursor);
    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async getSaved(userId: string, cursor?: string): Promise<MyLibraryPageDto> {
    const { items, nextCursor } = await this.repo.findSaved(userId, cursor);
    return { items, nextCursor, hasMore: !!nextCursor };
  }

  async getSavedDelta(userId: string, since?: string): Promise<SavedDeltaItemDto[]> {
    return this.repo.findSavedDelta(userId, since ? new Date(since) : undefined);
  }

  async getRecentProgress(userId: string): Promise<RecentProgressDto | null> {
    return this.repo.getRecentProgress(userId);
  }

  async saveListing(userId: string, slug: string): Promise<void> {
    const found = await this.repo.saveLecture(userId, slug);
    if (!found) {
      throw new NotFoundException(`Listing ${slug} not found`);
    }
  }

  async unsaveListing(userId: string, slug: string): Promise<void> {
    const found = await this.repo.unsaveLecture(userId, slug);
    if (!found) {
      throw new NotFoundException(`Listing ${slug} not found`);
    }
  }

  async bulkSyncSaved(userId: string, items: SavedSyncItemDto[]): Promise<void> {
    await this.repo.bulkSync(userId, items);
  }
}
