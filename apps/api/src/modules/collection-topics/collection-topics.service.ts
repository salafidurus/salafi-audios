import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionTopicsRepository } from './collection-topics.repo';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';

@Injectable()
export class CollectionTopicsService {
  constructor(private readonly repo: CollectionTopicsRepository) {}

  async list(
    scholarSlug: string,
    collectionSlug: string,
  ): Promise<LectureTopicViewDto[]> {
    const rows = await this.repo.listByScholarAndCollectionSlug(
      scholarSlug,
      collectionSlug,
    );
    if (!rows) throw new NotFoundException('Collection not found');
    return rows;
  }

  async attach(
    scholarSlug: string,
    collectionSlug: string,
    topicSlug: string,
  ): Promise<LectureTopicViewDto> {
    const attached = await this.repo.attach(
      scholarSlug,
      collectionSlug,
      topicSlug,
    );
    if (!attached) throw new NotFoundException('Collection or topic not found');
    return attached;
  }

  async detach(
    scholarSlug: string,
    collectionSlug: string,
    topicSlug: string,
  ): Promise<{ ok: true }> {
    const ok = await this.repo.detach(scholarSlug, collectionSlug, topicSlug);
    if (!ok) throw new NotFoundException('Collection or topic not found');
    return { ok: true };
  }
}
