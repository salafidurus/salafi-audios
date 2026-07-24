import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type {
  TopicDetailDto,
  TopicLectureViewDto,
  TranslationViewDto,
  AdminTopicDetailDto,
} from '@sd/core-contracts';
import { SUPPORTED_LOCALES } from '@sd/core-contracts';
import type { CreateTopicWithTranslationsDto } from '@sd/core-contracts';
import type { UpdateTopicWithTranslationsDto } from '@sd/core-contracts';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';
import { TopicsRepository } from './topics.repo';

@Injectable()
export class TopicsService {
  constructor(
    private readonly repo: TopicsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
    await this.invalidateCache(slug);
  }

  private async invalidateCache(slug?: string): Promise<void> {
    // LocaleCacheInterceptor uses format: ${url}:${locale}[:${userId}]
    const cacheKeysToInvalidate: string[] = [];

    // Invalidate list cache
    for (const locale of SUPPORTED_LOCALES) {
      cacheKeysToInvalidate.push(`/topics:${locale}`);
    }

    // Also invalidate detail caches when a specific slug is provided
    if (slug) {
      for (const locale of SUPPORTED_LOCALES) {
        cacheKeysToInvalidate.push(`/topics/${slug}:${locale}`);
      }
    }

    await Promise.all(cacheKeysToInvalidate.map((key) => this.cacheManager.del(key)));
  }

  // ─── New admin combined methods ─────────────────────────────────────────

  async getAdminDetail(slug: string): Promise<AdminTopicDetailDto> {
    const found = await this.repo.findBySlug(slug);
    if (!found) throw new NotFoundException(`Topic "${slug}" not found`);
    const translations = await this.repo.listTopicTranslations(found.id);
    return { ...found, translations };
  }

  async createWithTranslations(dto: CreateTopicWithTranslationsDto): Promise<AdminTopicDetailDto> {
    const result = await this.upsertWithTranslations(dto.slug, {
      name: dto.name,
      orderIndex: dto.orderIndex,
      translations: dto.translations ?? [],
    });
    await this.invalidateCache(result.slug);
    return result;
  }

  async updateWithTranslations(
    slug: string,
    dto: UpdateTopicWithTranslationsDto,
  ): Promise<AdminTopicDetailDto> {
    const result = await this.upsertWithTranslations(slug, {
      name: dto.name,
      orderIndex: dto.orderIndex,
      translations: dto.translations,
    });
    await this.invalidateCache(slug);
    return result;
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
