import { Injectable } from '@nestjs/common';
import type { QuickBrowseDto } from '@sd/core-contracts';
import { HomeRepo } from './home.repo';

@Injectable()
export class HomeService {
  constructor(private readonly repo: HomeRepo) {}

  async getQuickBrowse(
    _topicSlugs?: string[],
    _scholarSlugs?: string[],
    userId?: string,
  ): Promise<QuickBrowseDto> {
    const [scholars, suggestions, recentProgress] = await Promise.all([
      this.repo.getScholars(),
      this.repo.getSuggestions(),
      userId ? this.repo.getRecentProgress(userId) : null,
    ]);

    return { scholars, suggestions, recentProgress };
  }
}
