import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type {
  ArrangeCommitDto,
  ArrangeCommitResultDto,
  BulkActionDto,
  BulkActionResultDto,
  Locale,
  SaveListingTranslationDto,
  TranslationViewDto,
  UpdateListingMediaDto,
} from '@sd/core-contracts';
import { SUPPORTED_LOCALES } from '@sd/core-contracts';
import { ListingRepository } from './listing.repo';

/** Application seam for authenticated Listing mutations. Catalog reads stay in ListingService. */
@Injectable()
export class ListingEditorialService {
  constructor(
    private readonly repo: ListingRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async publish(id: string, updatedBy?: string): Promise<{ success: boolean }> {
    await this.repo.transitionListingStatus(id, 'publish', updatedBy);
    await this.invalidateCache(id);
    return { success: true };
  }

  async archive(id: string, updatedBy?: string): Promise<{ success: boolean }> {
    await this.repo.transitionListingStatus(id, 'archive', updatedBy);
    await this.invalidateCache(id);
    return { success: true };
  }

  async arrange(
    id: string,
    dto: ArrangeCommitDto,
    userId?: string,
  ): Promise<ArrangeCommitResultDto> {
    const { result, affectedIds } = await this.repo.arrangeCommit(id, dto, userId);
    await Promise.all(affectedIds.map((affectedId) => this.invalidateCache(affectedId)));
    return result;
  }

  async replace(
    id: string,
    dto: UpdateListingMediaDto,
    updatedBy?: string,
  ): Promise<{ success: boolean }> {
    if (!dto.audioKey)
      throw new BadRequestException('Replacing listing media requires an audio key');
    const ok = await this.repo.updateListingMedia(id, dto, updatedBy);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    await this.invalidateCache(id);
    return { success: true };
  }

  async remove(id: string, deletedBy?: string): Promise<{ success: boolean }> {
    const ok = await this.repo.deleteListing(id, deletedBy);
    if (!ok) throw new NotFoundException(`Listing "${id}" not found`);
    await this.invalidateCache(id);
    return { success: true };
  }

  async bulkStatus(dto: BulkActionDto, updatedBy?: string): Promise<BulkActionResultDto> {
    const action = dto.action === 'publish' ? 'publish' : 'archive';
    const results = await Promise.all(
      dto.ids.map(async (id) => {
        try {
          await this.repo.transitionListingStatus(id, action, updatedBy);
          await this.invalidateCache(id);
          return { id, succeeded: true };
        } catch {
          return { id, succeeded: false };
        }
      }),
    );
    const succeeded: string[] = [];
    const failed: string[] = [];
    for (const result of results) {
      (result.succeeded ? succeeded : failed).push(result.id);
    }
    return { succeeded, failed };
  }

  async translate(
    listingSlug: string,
    dto: SaveListingTranslationDto,
  ): Promise<TranslationViewDto> {
    const listingId = await this.requireListingId(listingSlug);
    const result = await this.repo.upsertListingTranslation(listingId, dto);
    await this.invalidateCache(listingSlug);
    return result;
  }

  async editTranslation(
    listingSlug: string,
    locale: Locale,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    const listingId = await this.requireListingId(listingSlug);
    const result = await this.repo.updateListingTranslation(listingId, locale, fields);
    await this.invalidateCache(listingSlug);
    return result;
  }

  async publishTranslation(listingSlug: string, locale: Locale): Promise<TranslationViewDto> {
    const listingId = await this.requireListingId(listingSlug);
    const result = await this.repo.publishListingTranslation(listingId, locale);
    await this.invalidateCache(listingSlug);
    return result;
  }

  async archiveTranslation(listingSlug: string, locale: Locale): Promise<TranslationViewDto> {
    const listingId = await this.requireListingId(listingSlug);
    const result = await this.repo.unpublishListingTranslation(listingId, locale);
    await this.invalidateCache(listingSlug);
    return result;
  }

  private async requireListingId(slug: string): Promise<string> {
    const listingId = await this.repo.findIdBySlug(slug);
    if (!listingId) throw new NotFoundException('Listing not found');
    return listingId;
  }

  private async invalidateCache(idOrSlug: string): Promise<void> {
    const keys = SUPPORTED_LOCALES.flatMap((locale) => [
      `/listings/${idOrSlug}:${locale}`,
      `/listings/${idOrSlug}/contents:${locale}`,
    ]);
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }
}
