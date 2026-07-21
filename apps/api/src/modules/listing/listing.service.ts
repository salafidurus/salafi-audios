import { Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '@sd/core-db';
import type {
  ListingDetailDto,
  RelatedListingDto,
  AdminListingListDto,
  AdminListingDetailDto,
  CreateListingDto,
  AdminListingUpdateDto,
  BulkActionDto,
  BulkActionResultDto,
  TranslationViewDto,
  SaveListingTranslationDto,
  ListingRefDto,
} from '@sd/core-contracts';
import { ListingRepository } from './listing.repo';

@Injectable()
export class ListingService {
  constructor(private readonly repo: ListingRepository) {}

  async getById(id: string): Promise<ListingDetailDto> {
    const listing = await this.repo.findDetailById(id);
    if (!listing) throw new NotFoundException(`Listing "${id}" not found`);
    return listing;
  }

  async getRelated(id: string): Promise<RelatedListingDto[]> {
    return this.repo.findRelated(id);
  }

  listAdmin(params: {
    cursor?: string;
    scholarId?: string;
    status?: string;
    search?: string;
  }): Promise<AdminListingListDto> {
    return this.repo.listAdmin(params);
  }

  async getAdminDetail(id: string): Promise<AdminListingDetailDto> {
    const listing = await this.repo.findAdminDetail(id);
    if (!listing) throw new NotFoundException(`Listing "${id}" not found`);
    return listing;
  }

  getSeriesOptions(scholarId: string): Promise<ListingRefDto[]> {
    return this.repo.findSeriesOptionsByScholar(scholarId);
  }

  createListing(
    dto: CreateListingDto & { publicUrl?: string },
    createdBy?: string,
  ): Promise<{ id: string; title: string }> {
    return this.repo.createWithAudioAsset(dto, createdBy);
  }

  async updateListing(
    id: string,
    dto: AdminListingUpdateDto,
    updatedBy?: string,
  ): Promise<{ success: boolean }> {
    const ok = await this.repo.updateListing(id, dto, updatedBy);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    return { success: true };
  }

  async publishListing(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateListingStatus(id, Status.published);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    return { success: true };
  }

  async archiveListing(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateListingStatus(id, Status.archived);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    return { success: true };
  }

  async bulkAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
    const status = dto.action === 'publish' ? Status.published : Status.archived;
    return this.repo.bulkUpdateStatus(dto.ids, status);
  }

  // ─── Translations ─────────────────────────────────────────────────────────

  listTranslations(listingId: string): Promise<TranslationViewDto[]> {
    return this.repo.listListingTranslations(listingId);
  }

  upsertTranslation(
    listingId: string,
    dto: SaveListingTranslationDto,
  ): Promise<TranslationViewDto> {
    return this.repo.upsertListingTranslation(listingId, dto);
  }

  updateTranslation(
    listingId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    return this.repo.updateListingTranslation(listingId, locale, fields);
  }

  publishTranslation(listingId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.publishListingTranslation(listingId, locale);
  }

  unpublishTranslation(listingId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.unpublishListingTranslation(listingId, locale);
  }
}
