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

  listKibar(limit?: number, cursor?: string): Promise<RecommendationPageDto> {
    return this.repo.listKibarItems(limit, cursor);
  }

  listTopic(
    topicSlug: string,
    limit?: number,
    cursor?: string,
  ): Promise<RecommendationPageDto> {
    return this.repo.listTopicItems(topicSlug, limit, cursor);
  }
}
