import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  TopicDetailDto,
  TopicViewDto,
  TopicLectureViewDto,
  TranslationViewDto,
} from '@sd/core-contracts';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';
import { TopicsRepository } from './topics.repo';

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
    const result = await this.repo.upsertBySlug({
      slug: dto.slug,
      name: dto.name.en,
      parentSlug: dto.parentSlug,
    });
    if (!result && dto.parentSlug) {
      throw new NotFoundException(`Parent topic "${dto.parentSlug}" not found`);
    }

    const topic = result ?? (await this.getBySlug(dto.slug));

    if (dto.name.ar && topic.id) {
      await this.repo.upsertTopicTranslation(topic.id, {
        locale: 'ar',
        name: dto.name.ar,
      });
    }

    // Save additional translations if provided in legacy format (or just keep it if needed, but the brief instructs to return refetched topic details)
    if (dto.translations && topic.id) {
      for (const [locale, fields] of Object.entries(dto.translations)) {
        if (fields.name) {
          // react-doctor-disable-next-line react-doctor/async-await-in-loop
          await this.repo.upsertTopicTranslation(topic.id, {
            locale: locale as any,
            name: fields.name,
          });
        }
      }
    }

    return this.getBySlug(topic.slug);
  }

  async listChildren(slug: string): Promise<TopicViewDto[]> {
    const result = await this.repo.listChildrenBySlug(slug);
    if (result === null) throw new NotFoundException('Topic not found');
    return result;
  }

  async listLectures(slug: string, limit?: number): Promise<TopicLectureViewDto[]> {
    const result = await this.repo.listPublishedLecturesByTopicSlug(slug, limit);
    if (result === null) throw new NotFoundException('Topic not found');
    return result;
  }

  async remove(slug: string): Promise<void> {
    const found = await this.repo.findBySlug(slug);
    if (!found) throw new NotFoundException(`Topic "${slug}" not found`);
    await this.repo.deleteBySlug(slug);
  }

  // ─── Topic translations ───────────────────────────────────────────────────

  listTranslations(topicId: string): Promise<TranslationViewDto[]> {
    return this.repo.listTopicTranslations(topicId);
  }

  upsertTranslation(topicId: string, dto: SaveTopicTranslationDto): Promise<TranslationViewDto> {
    return this.repo.upsertTopicTranslation(topicId, dto);
  }

  updateTranslation(
    topicId: string,
    locale: string,
    fields: Partial<{ name: string }>,
  ): Promise<TranslationViewDto> {
    return this.repo.updateTopicTranslation(topicId, locale, fields);
  }

  publishTranslation(topicId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.publishTopicTranslation(topicId, locale);
  }

  unpublishTranslation(topicId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.unpublishTopicTranslation(topicId, locale);
  }
}
