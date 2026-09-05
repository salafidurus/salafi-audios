import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type {
  CreateScholarDto,
  SaveScholarTranslationDto,
  UpdateScholarDto,
  ScholarDetailDto,
  ScholarDetailStats,
  ScholarContentUnifiedDto,
  ScholarTopicsDto,
  TranslationViewDto,
  AdminScholarListDto,
  Locale,
  ScholarPageFeedDto,
  ScholarListDto,
} from '@sd/core-contracts';
import { SUPPORTED_LOCALES } from '@sd/core-contracts';
import { ScholarsRepository } from './scholars.repo';
import { ScholarPageFeedService } from '../recommendation/scholar-page-feed.service';

/** NestJS scholars service service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** scholars application module responsible for scholars.service behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ScholarsService {
  constructor(
    @Inject(ScholarsRepository) private readonly repo: ScholarsRepository,
    @Inject(ScholarPageFeedService) private readonly pageFeed: ScholarPageFeedService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /** Returns the recommendation-composed root Scholars page feed. */
  async getPageFeed(): Promise<ScholarPageFeedDto> {
    const recommendation = await this.pageFeed.recommend();
    return this.repo.hydratePageFeed(recommendation);
  }

  directory(): Promise<ScholarListDto> {
    return this.repo.directory();
  }

  search(query: string): Promise<ScholarListDto> {
    return this.repo.search(query);
  }

  adminList(
    cursor?: string,
    search?: string,
    accessibleScholarIds?: string[],
  ): Promise<AdminScholarListDto> {
    return this.repo.adminList(cursor, search, accessibleScholarIds);
  }

  async getBySlug(slug: string): Promise<ScholarDetailDto & ScholarDetailStats> {
    const found = await this.repo.findBySlug(slug);
    if (!found) throw new NotFoundException(`Scholar "${slug}" not found`);
    return found;
  }

  async getContent(slug: string): Promise<ScholarContentUnifiedDto> {
    const content = await this.repo.getContent(slug);
    if (!content) throw new NotFoundException(`Scholar "${slug}" not found`);
    return content;
  }

  async getTopics(slug: string): Promise<ScholarTopicsDto> {
    const topics = await this.repo.getTopics(slug);
    if (!topics) throw new NotFoundException(`Scholar "${slug}" not found`);
    return topics;
  }

  getFormData(scholarId: string) {
    return this.repo.getFormData(scholarId);
  }

  async create(dto: CreateScholarDto) {
    // Repository handles both scholar creation and translations in a single transaction
    const result = await this.repo.create(dto);
    await this.invalidateCache(result.slug);
    return result;
  }

  async update(id: string, dto: UpdateScholarDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Scholar "${id}" not found`);
    // Repository handles both scholar update and translations in a single transaction
    const result = await this.repo.update(id, dto);
    await this.invalidateCache(result.slug);
    return result;
  }

  private async invalidateCache(slug: string): Promise<void> {
    // LocaleCacheInterceptor uses format: ${url}:${locale}[:${userId}]
    const cacheKeysToInvalidate: string[] = [];

    // Invalidate root page-feed and flat-directory caches.
    for (const locale of SUPPORTED_LOCALES) {
      cacheKeysToInvalidate.push(`/v1/scholars:${locale}`);
      cacheKeysToInvalidate.push(`/v1/scholars/directory:${locale}`);
    }

    // Invalidate detail caches
    for (const locale of SUPPORTED_LOCALES) {
      cacheKeysToInvalidate.push(`/v1/scholars/${slug}:${locale}`);
    }

    await Promise.all(cacheKeysToInvalidate.map((key) => this.cacheManager.del(key)));
  }

  // ─── Scholar translations ─────────────────────────────────────────────────

  async listTranslations(scholarSlug: string): Promise<TranslationViewDto[]> {
    const scholarId = await this.repo.findIdBySlug(scholarSlug);
    if (!scholarId) throw new NotFoundException('Scholar not found');
    return this.repo.listScholarTranslations(scholarId);
  }

  async upsertTranslation(
    scholarSlug: string,
    dto: SaveScholarTranslationDto,
  ): Promise<TranslationViewDto> {
    const scholarId = await this.repo.findIdBySlug(scholarSlug);
    if (!scholarId) throw new NotFoundException('Scholar not found');
    const [result, scholar] = await Promise.all([
      this.repo.upsertScholarTranslation(scholarId, dto),
      this.repo.findById(scholarId),
    ]);
    if (scholar) {
      await this.invalidateCache(scholar.slug);
    }
    return result;
  }

  async updateTranslation(
    scholarSlug: string,
    locale: Locale,
    fields: Partial<{ name: string; bio: string | null }>,
  ): Promise<TranslationViewDto> {
    const scholarId = await this.repo.findIdBySlug(scholarSlug);
    if (!scholarId) throw new NotFoundException('Scholar not found');
    const [result, scholar] = await Promise.all([
      this.repo.updateScholarTranslation(scholarId, locale, fields),
      this.repo.findById(scholarId),
    ]);
    if (scholar) {
      await this.invalidateCache(scholar.slug);
    }
    return result;
  }

  async publishTranslation(scholarSlug: string, locale: Locale): Promise<TranslationViewDto> {
    const scholarId = await this.repo.findIdBySlug(scholarSlug);
    if (!scholarId) throw new NotFoundException('Scholar not found');
    const [result, scholar] = await Promise.all([
      this.repo.publishScholarTranslation(scholarId, locale),
      this.repo.findById(scholarId),
    ]);
    if (scholar) {
      await this.invalidateCache(scholar.slug);
    }
    return result;
  }

  async unpublishTranslation(scholarSlug: string, locale: Locale): Promise<TranslationViewDto> {
    const scholarId = await this.repo.findIdBySlug(scholarSlug);
    if (!scholarId) throw new NotFoundException('Scholar not found');
    const [result, scholar] = await Promise.all([
      this.repo.unpublishScholarTranslation(scholarId, locale),
      this.repo.findById(scholarId),
    ]);
    if (scholar) {
      await this.invalidateCache(scholar.slug);
    }
    return result;
  }
}
