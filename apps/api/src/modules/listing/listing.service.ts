import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Status } from '@sd/core-db';
import type {
  ListingDetailDto,
  RelatedListingDto,
  AdminListingListDto,
  AdminListingDetailDto,
  CreateListingDto,
  UpdateListingDetailsDto,
  UpdateListingMediaDto,
  AdminListingMediaDetailDto,
  BulkActionDto,
  BulkActionResultDto,
  TranslationViewDto,
  SaveListingTranslationDto,
  ListingRefDto,
  ListingContentsDto,
  LastPlayedLessonDto,
  ListingProgressSummaryDto,
  FeedPageDto,
  AdminArrangeDataDto,
  ArrangeCommitDto,
  ArrangeCommitResultDto,
} from '@sd/core-contracts';
import { SUPPORTED_LOCALES } from '@sd/core-contracts';
import { ListingRepository } from './listing.repo';
import { RecentListingsRepo } from './listing-recent.repo';

@Injectable()
export class ListingService {
  constructor(
    private readonly repo: ListingRepository,
    private readonly recentRepo: RecentListingsRepo,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getById(id: string): Promise<ListingDetailDto> {
    const listing = await this.repo.findDetailById(id);
    if (!listing) throw new NotFoundException(`Listing "${id}" not found`);
    return listing;
  }

  async getRelated(id: string): Promise<RelatedListingDto[]> {
    return this.repo.findRelated(id);
  }

  async getRecentListings(cursor?: string, limit?: number): Promise<FeedPageDto> {
    return this.recentRepo.getRecentListings(cursor, limit);
  }

  async getPromotions(): Promise<any> {
    return this.repo.findPromotions();
  }

  async updatePromotions(body: any): Promise<any> {
    return this.repo.updatePromotions(body);
  }

  async getContents(id: string): Promise<ListingContentsDto> {
    const contents = await this.repo.findContentsById(id);
    if (!contents) throw new NotFoundException(`Listing "${id}" not found`);
    return contents;
  }

  async getLastPlayedLesson(id: string, userId: string): Promise<LastPlayedLessonDto | null> {
    return this.repo.findLastPlayedLesson(id, userId);
  }

  async getProgressSummary(id: string, userId: string): Promise<ListingProgressSummaryDto | null> {
    return this.repo.getProgressSummary(id, userId);
  }

  listAdmin(params: {
    cursor?: string;
    scholarId?: string;
    status?: string;
    search?: string;
    accessibleScholarIds?: string[];
  }): Promise<AdminListingListDto> {
    return this.repo.listAdmin(params);
  }

  async getAdminDetail(id: string): Promise<AdminListingDetailDto> {
    const listing = await this.repo.findAdminDetail(id);
    if (!listing) throw new NotFoundException(`Listing "${id}" not found`);
    return listing;
  }

  getFormData(listingId: string) {
    return this.repo.getFormData(listingId);
  }

  getSeriesOptions(scholarId: string): Promise<ListingRefDto[]> {
    return this.repo.findSeriesOptionsByScholar(scholarId);
  }

  async createListing(
    dto: CreateListingDto & { publicUrl?: string },
    createdBy?: string,
  ): Promise<{ id: string; title: string }> {
    const result = await this.repo.createWithAudioAsset(dto, createdBy);
    await this.invalidateCache(result.id);
    return result;
  }

  async updateListingDetails(
    id: string,
    dto: UpdateListingDetailsDto,
    updatedBy?: string,
  ): Promise<{ success: boolean }> {
    const ok = await this.repo.updateListingDetails(id, dto, updatedBy);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    await this.invalidateCache(id);
    return { success: true };
  }

  async updateListingMedia(
    id: string,
    dto: UpdateListingMediaDto,
    updatedBy?: string,
  ): Promise<{ success: boolean }> {
    const ok = await this.repo.updateListingMedia(id, dto, updatedBy);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    await this.invalidateCache(id);
    return { success: true };
  }

  async getMediaData(id: string): Promise<AdminListingMediaDetailDto> {
    const data = await this.repo.getMediaData(id);
    if (!data) throw new NotFoundException(`Listing "${id}" not found`);
    return data;
  }

  async getArrangeData(id: string): Promise<AdminArrangeDataDto> {
    const data = await this.repo.getArrangeData(id);
    if (!data) throw new NotFoundException(`Listing "${id}" not found`);
    return data;
  }

  async arrangeCommit(
    id: string,
    dto: ArrangeCommitDto,
    userId?: string,
  ): Promise<ArrangeCommitResultDto> {
    const { result, affectedIds } = await this.repo.arrangeCommit(id, dto, userId);
    await Promise.all(affectedIds.map((affectedId) => this.invalidateCache(affectedId)));
    return result;
  }

  async publishListing(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateListingStatus(id, Status.published);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    await this.invalidateCache(id);
    return { success: true };
  }

  async archiveListing(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateListingStatus(id, Status.archived);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    await this.invalidateCache(id);
    return { success: true };
  }

  async bulkAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
    const status = dto.action === 'publish' ? Status.published : Status.archived;
    const result = await this.repo.bulkUpdateStatus(dto.ids, status);
    // Invalidate cache for all affected listings
    await Promise.all(dto.ids.map((id) => this.invalidateCache(id)));
    return result;
  }

  private async invalidateCache(id: string): Promise<void> {
    // LocaleCacheInterceptor uses format: ${url}:${locale}[:${userId}]
    const cacheKeysToInvalidate: string[] = [];

    // Invalidate listing detail and contents caches
    for (const locale of SUPPORTED_LOCALES) {
      cacheKeysToInvalidate.push(`/listings/${id}:${locale}`);
      cacheKeysToInvalidate.push(`/listings/${id}/contents:${locale}`);
    }

    await Promise.all(cacheKeysToInvalidate.map((key) => this.cacheManager.del(key)));
  }

  // ─── Translations ─────────────────────────────────────────────────────────

  async listTranslations(listingSlug: string): Promise<TranslationViewDto[]> {
    const listingId = await this.repo.findIdBySlug(listingSlug);
    if (!listingId) throw new NotFoundException('Listing not found');
    return this.repo.listListingTranslations(listingId);
  }

  async upsertTranslation(
    listingSlug: string,
    dto: SaveListingTranslationDto,
  ): Promise<TranslationViewDto> {
    const listingId = await this.repo.findIdBySlug(listingSlug);
    if (!listingId) throw new NotFoundException('Listing not found');
    const result = await this.repo.upsertListingTranslation(listingId, dto);
    await this.invalidateCache(listingSlug);
    return result;
  }

  async updateTranslation(
    listingSlug: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    const listingId = await this.repo.findIdBySlug(listingSlug);
    if (!listingId) throw new NotFoundException('Listing not found');
    const result = await this.repo.updateListingTranslation(listingId, locale, fields);
    await this.invalidateCache(listingSlug);
    return result;
  }

  async publishTranslation(listingSlug: string, locale: string): Promise<TranslationViewDto> {
    const listingId = await this.repo.findIdBySlug(listingSlug);
    if (!listingId) throw new NotFoundException('Listing not found');
    const result = await this.repo.publishListingTranslation(listingId, locale);
    await this.invalidateCache(listingSlug);
    return result;
  }

  async unpublishTranslation(listingSlug: string, locale: string): Promise<TranslationViewDto> {
    const listingId = await this.repo.findIdBySlug(listingSlug);
    if (!listingId) throw new NotFoundException('Listing not found');
    const result = await this.repo.unpublishListingTranslation(listingId, locale);
    await this.invalidateCache(listingSlug);
    return result;
  }
}
