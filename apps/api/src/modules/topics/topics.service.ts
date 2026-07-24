import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  TopicDetailDto,
  TopicLectureViewDto,
  TranslationViewDto,
  AdminTopicDetailDto,
} from '@sd/core-contracts';
import type { CreateTopicWithTranslationsDto } from '@sd/core-contracts';
import type { UpdateTopicWithTranslationsDto } from '@sd/core-contracts';
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

  // ─── New admin combined methods ─────────────────────────────────────────

  async getAdminDetail(slug: string): Promise<AdminTopicDetailDto> {
    const found = await this.repo.findBySlug(slug);
    if (!found) throw new NotFoundException(`Topic "${slug}" not found`);
    const translations = await this.repo.listTopicTranslations(found.id);
    return { ...found, translations };
  }

  async createWithTranslations(dto: CreateTopicWithTranslationsDto): Promise<AdminTopicDetailDto> {
    return this.upsertWithTranslations(dto.slug, {
      name: dto.name,
      orderIndex: dto.orderIndex,
      translations: dto.translations ?? [],
    });
  }

  async updateWithTranslations(
    slug: string,
    dto: UpdateTopicWithTranslationsDto,
  ): Promise<AdminTopicDetailDto> {
    return this.upsertWithTranslations(slug, {
      name: dto.name,
      orderIndex: dto.orderIndex,
      translations: dto.translations,
    });
  }

  private async upsertWithTranslations(
    slug: string,
    data: {
      name: { en: string };
      orderIndex?: number;
      translations: Array<{ locale: string; name: string }>;
    },
  ): Promise<AdminTopicDetailDto> {
    const topic = await this.repo.upsertBySlug({
      slug,
      name: data.name.en,
      orderIndex: data.orderIndex,
    });

    await Promise.all(
      data.translations.map((t) => {
        if (t.name.trim()) {
          return this.repo.upsertTopicTranslation(topic.id, {
            locale: t.locale as any,
            name: t.name,
          });
        } else {
          return this.repo.deleteTopicTranslation(topic.id, t.locale);
        }
      }),
    );

    return this.getAdminDetail(topic.slug);
  }

  // ─── Topic translations (separate endpoints) ───────────────────────────

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
}
