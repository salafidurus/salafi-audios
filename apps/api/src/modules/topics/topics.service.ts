import { Injectable, NotFoundException } from '@nestjs/common';
import { TopicDetailDto } from './dto/topic-detail.dto';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { TopicsRepository } from './topics.repo';
import { TopicViewDto } from '../lecture-topics/dto/topic-view.dto';
import { TopicLectureViewDto } from './dto/topic-lecture-view.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly repo: TopicsRepository) {}

  list(): Promise<TopicDetailDto[]> {
    return this.repo.list();
  }

  async getBySlug(slug: string): Promise<TopicDetailDto> {
    const found = await this.repo.findBySlug(slug);
    if (!found) throw new NotFoundException(`Topic "${slug}" not found`);
    return found;
  }

  async upsert(dto: UpsertTopicDto): Promise<TopicDetailDto> {
    const result = await this.repo.upsertBySlug(dto);
    if (!result && dto.parentSlug) {
      throw new NotFoundException(`Parent topic "${dto.parentSlug}" not found`);
    }
    return result ?? (await this.getBySlug(dto.slug)); // safe fallback if upsert somehow returns null without parentSlug
  }

  async listChildren(slug: string): Promise<TopicViewDto[]> {
    const result = await this.repo.listChildrenBySlug(slug);
    if (result === null) throw new NotFoundException('Topic not found');
    return result;
  }

  async listLectures(
    slug: string,
    limit?: number,
  ): Promise<TopicLectureViewDto[]> {
    const result = await this.repo.listPublishedLecturesByTopicSlug(
      slug,
      limit,
    );
    if (result === null) throw new NotFoundException('Topic not found');
    return result;
  }
}
