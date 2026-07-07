import { Injectable } from '@nestjs/common';
import type { FeedPageDto, ScholarChipDto } from '@sd/core-contracts';
import { ExploreRepo } from './explore.repo';

@Injectable()
export class ExploreService {
  constructor(private readonly repo: ExploreRepo) {}

  async getExplore(
    cursor?: string,
    limit = 20,
    topicSlugs?: string[],
    scholarSlugs?: string[],
  ): Promise<FeedPageDto> {
    return this.repo.getExplore(cursor, limit, topicSlugs, scholarSlugs);
  }

  async getExploreRecent(cursor?: string, limit = 20): Promise<FeedPageDto> {
    return this.repo.getExploreRecent(cursor, limit);
  }

  async getFollowingExplore(cursor?: string, limit = 20): Promise<FeedPageDto> {
    return this.repo.getExplore(cursor, limit);
  }

  async getScholars(): Promise<{ scholars: ScholarChipDto[] }> {
    const scholars = await this.repo.getScholars();
    return { scholars };
  }
}
