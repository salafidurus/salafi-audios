import { Injectable } from '@nestjs/common';
import type { FeedPageDto, ScholarChipDto } from '@sd/core-contracts';
import { FeedRepo } from './feed.repo';

@Injectable()
export class FeedService {
  constructor(private readonly repo: FeedRepo) {}

  async getFeed(
    cursor?: string,
    limit = 20,
    topicSlugs?: string[],
    scholarSlugs?: string[],
  ): Promise<FeedPageDto> {
    return this.repo.getFeed(cursor, limit, topicSlugs, scholarSlugs);
  }

  async getFeedRecent(cursor?: string, limit = 20): Promise<FeedPageDto> {
    return this.repo.getFeedRecent(cursor, limit);
  }

  async getFollowingFeed(cursor?: string, limit = 20): Promise<FeedPageDto> {
    return this.repo.getFeed(cursor, limit);
  }

  async getScholars(): Promise<{ scholars: ScholarChipDto[] }> {
    const scholars = await this.repo.getScholars();
    return { scholars };
  }
}
