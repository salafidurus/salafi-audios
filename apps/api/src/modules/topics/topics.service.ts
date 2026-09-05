import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type {
  TopicDetailDto,
  TopicLectureViewDto,
  TranslationViewDto,
  AdminTopicDetailDto,
  CreateTopicWithTranslationsDto,
  UpdateTopicWithTranslationsDto,
  SaveTopicTranslationDto,
  Locale,
} from '@sd/core-contracts';
import { SUPPORTED_LOCALES } from '@sd/core-contracts';
import { TopicsRepository } from './topics.repo';

/** NestJS topics service service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** topics application module responsible for topics.service behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
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
      cacheKeysToInvalidate.push(`/v1/topics:${locale}`);
    }

    // Also invalidate detail caches when a specific slug is provided
    if (slug) {
      for (const locale of SUPPORTED_LOCALES) {
        cacheKeysToInvalidate.push(`/v1/topics/${slug}:${locale}`);
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
    const result = await this.upsertMainFields(dto.slug, {
      name: dto.name,
      orderIndex: dto.orderIndex,
    });
    await this.invalidateCache(result.slug);
    return result;
  }

  async updateWithTranslations(
    slug: string,
    dto: UpdateTopicWithTranslationsDto,
  ): Promise<AdminTopicDetailDto> {
    const result = await this.upsertMainFields(slug, {
      name: dto.name,
      orderIndex: dto.orderIndex,
    });
    await this.invalidateCache(slug);
    return result;
  }

  private async upsertMainFields(
    slug: string,
    data: { name: { ar: string }; orderIndex?: number },
  ): Promise<AdminTopicDetailDto> {
    const topic = await this.repo.upsertBySlug({
      slug,
      name: data.name.ar,
      orderIndex: data.orderIndex,
    });

    return this.getAdminDetail(topic.slug);
  }

  // ─── Topic translations (separate endpoints) ───────────────────────────

  listTranslations(topicId: string): Promise<TranslationViewDto[]> {
    return this.repo.listTopicTranslations(topicId);
  }

  async upsertTranslation(
    topicId: string,
    dto: SaveTopicTranslationDto,
  ): Promise<TranslationViewDto> {
    const result = await this.repo.upsertTopicTranslation(topicId, dto);
    // Invalidate both list and detail caches for all locales
    await this.invalidateCache();
    return result;
  }

  async updateTranslation(
    topicId: string,
    locale: Locale,
    fields: Partial<{ name: string }>,
  ): Promise<TranslationViewDto> {
    const result = await this.repo.updateTopicTranslation(topicId, locale, fields);
    // Invalidate both list and detail caches for all locales
    await this.invalidateCache();
    return result;
  }
}
