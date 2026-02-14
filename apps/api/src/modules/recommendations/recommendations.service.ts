import { Injectable } from '@nestjs/common';
import { RecommendationsRepository } from './recommendations.repo';
import { RecommendationHeroItemDto } from './dto/recommendation-hero-item.dto';
import { RecommendationPageDto } from './dto/recommendation-page.dto';

@Injectable()
export class RecommendationsService {
  constructor(private readonly repo: RecommendationsRepository) {}

  listHero(limit?: number): Promise<RecommendationHeroItemDto[]> {
    return this.repo.listHeroItems(limit);
  }

  listRecommendedKibar(
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listRecommendedKibar(limit, cursor);
  }

  listRecommendedRecentPlay(
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listRecommendedRecentPlay(limit, cursor);
  }

  listRecommendedTopics(
    topicsCsv: string | undefined,
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listRecommendedTopics(topicsCsv, limit, cursor);
  }

  listFollowingScholars(
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listFollowingScholars(limit, cursor);
  }

  listFollowingTopics(
    topicsCsv: string | undefined,
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listFollowingTopics(topicsCsv, limit, cursor);
  }

  listLatest(limit?: number, cursor?: string): Promise<RecommendationPageDto> {
    return this.repo.listLatest(limit, cursor);
  }

  listLatestTopics(
    topicsCsv: string | undefined,
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listLatestTopics(topicsCsv, limit, cursor);
  }

  listPopular(
    windowDays: number | undefined,
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listPopular(windowDays, limit, cursor);
  }

  listPopularTopics(
    topicsCsv: string | undefined,
    windowDays: number | undefined,
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listPopularTopics(topicsCsv, windowDays, limit, cursor);
  }
}
