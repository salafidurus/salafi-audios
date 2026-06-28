import { Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '@sd/core-db';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarContentUnifiedDto,
  TranslationViewDto,
  AdminSeriesListItemDto,
  AdminSeriesDetailDto,
  AdminCollectionListItemDto,
  AdminCollectionDetailDto,
  BulkActionDto,
  BulkActionResultDto,
} from '@sd/core-contracts';
import { ScholarsRepository } from './scholars.repo';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';
import type { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';
import type { SaveSeriesTranslationDto } from './dto/save-series-translation.dto';
import type { SaveCollectionTranslationDto } from './dto/save-collection-translation.dto';
import type { CreateSeriesDto } from './dto/create-series.dto';
import type { UpdateSeriesDto } from './dto/update-series.dto';
import type { CreateCollectionDto } from './dto/create-collection.dto';
import type { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class ScholarsService {
  constructor(private readonly repo: ScholarsRepository) {}

  list(): Promise<{ scholars: ScholarListItemDto[] }> {
    return this.repo.list();
  }

  async getBySlug(slug: string): Promise<
    ScholarDetailDto & {
      lectureCount: number;
      seriesCount: number;
      totalDurationSeconds: number;
    }
  > {
    const found = await this.repo.findBySlug(slug);
    if (!found) throw new NotFoundException(`Scholar "${slug}" not found`);
    return found;
  }

  async getContent(slug: string): Promise<ScholarContentUnifiedDto> {
    const content = await this.repo.getContent(slug);
    if (!content) throw new NotFoundException(`Scholar "${slug}" not found`);
    return content;
  }

  async create(dto: CreateScholarDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateScholarDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Scholar "${id}" not found`);
    return this.repo.update(id, dto);
  }

  // ─── Scholar translations ─────────────────────────────────────────────────

  listTranslations(scholarId: string): Promise<TranslationViewDto[]> {
    return this.repo.listScholarTranslations(scholarId);
  }

  upsertTranslation(
    scholarId: string,
    dto: SaveScholarTranslationDto,
  ): Promise<TranslationViewDto> {
    return this.repo.upsertScholarTranslation(scholarId, dto);
  }

  updateTranslation(
    scholarId: string,
    locale: string,
    fields: Partial<{ name: string; bio: string | null }>,
  ): Promise<TranslationViewDto> {
    return this.repo.updateScholarTranslation(scholarId, locale, fields);
  }

  publishTranslation(scholarId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.publishScholarTranslation(scholarId, locale);
  }

  unpublishTranslation(scholarId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.unpublishScholarTranslation(scholarId, locale);
  }

  // ─── Series translations ──────────────────────────────────────────────────

  listSeriesTranslations(seriesId: string): Promise<TranslationViewDto[]> {
    return this.repo.listSeriesTranslations(seriesId);
  }

  upsertSeriesTranslation(
    seriesId: string,
    dto: SaveSeriesTranslationDto,
  ): Promise<TranslationViewDto> {
    return this.repo.upsertSeriesTranslation(seriesId, dto);
  }

  updateSeriesTranslation(
    seriesId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    return this.repo.updateSeriesTranslation(seriesId, locale, fields);
  }

  publishSeriesTranslation(seriesId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.publishSeriesTranslation(seriesId, locale);
  }

  unpublishSeriesTranslation(seriesId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.unpublishSeriesTranslation(seriesId, locale);
  }

  // ─── Collection translations ──────────────────────────────────────────────

  listCollectionTranslations(collectionId: string): Promise<TranslationViewDto[]> {
    return this.repo.listCollectionTranslations(collectionId);
  }

  upsertCollectionTranslation(
    collectionId: string,
    dto: SaveCollectionTranslationDto,
  ): Promise<TranslationViewDto> {
    return this.repo.upsertCollectionTranslation(collectionId, dto);
  }

  updateCollectionTranslation(
    collectionId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    return this.repo.updateCollectionTranslation(collectionId, locale, fields);
  }

  publishCollectionTranslation(collectionId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.publishCollectionTranslation(collectionId, locale);
  }

  unpublishCollectionTranslation(
    collectionId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    return this.repo.unpublishCollectionTranslation(collectionId, locale);
  }

  // ─── Admin Series Methods ──────────────────────────────────────────────────

  listAdminSeries(scholarId: string): Promise<AdminSeriesListItemDto[]> {
    return this.repo.listAdminSeries(scholarId);
  }

  async getAdminSeriesDetail(id: string): Promise<AdminSeriesDetailDto> {
    const s = await this.repo.findAdminSeriesDetail(id);
    if (!s) throw new NotFoundException(`Series "${id}" not found`);
    return s;
  }

  createSeries(dto: CreateSeriesDto): Promise<{ id: string }> {
    return this.repo.createSeries(dto);
  }

  async updateSeries(id: string, dto: UpdateSeriesDto): Promise<{ id: string }> {
    const updated = await this.repo.updateSeries(id, dto);
    if (!updated) throw new NotFoundException(`Series "${id}" not found`);
    return updated;
  }

  async publishSeries(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateSeriesStatus(id, Status.published);
    if (!ok) throw new NotFoundException(`Series "${id}" not found`);
    return { success: true };
  }

  async archiveSeries(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateSeriesStatus(id, Status.archived);
    if (!ok) throw new NotFoundException(`Series "${id}" not found`);
    return { success: true };
  }

  bulkSeriesAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
    const status = dto.action === 'publish' ? Status.published : Status.archived;
    return this.repo.bulkUpdateSeriesStatus(dto.ids, status);
  }

  // ─── Admin Collection Methods ──────────────────────────────────────────────

  listAdminCollections(scholarId: string): Promise<AdminCollectionListItemDto[]> {
    return this.repo.listAdminCollections(scholarId);
  }

  async getAdminCollectionDetail(id: string): Promise<AdminCollectionDetailDto> {
    const c = await this.repo.findAdminCollectionDetail(id);
    if (!c) throw new NotFoundException(`Collection "${id}" not found`);
    return c;
  }

  createCollection(dto: CreateCollectionDto): Promise<{ id: string }> {
    return this.repo.createCollection(dto);
  }

  async updateCollection(id: string, dto: UpdateCollectionDto): Promise<{ id: string }> {
    const updated = await this.repo.updateCollection(id, dto);
    if (!updated) throw new NotFoundException(`Collection "${id}" not found`);
    return updated;
  }

  async publishCollection(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateCollectionStatus(id, Status.published);
    if (!ok) throw new NotFoundException(`Collection "${id}" not found`);
    return { success: true };
  }

  async archiveCollection(id: string): Promise<{ success: boolean }> {
    const ok = await this.repo.updateCollectionStatus(id, Status.archived);
    if (!ok) throw new NotFoundException(`Collection "${id}" not found`);
    return { success: true };
  }

  bulkCollectionAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
    const status = dto.action === 'publish' ? Status.published : Status.archived;
    return this.repo.bulkUpdateCollectionStatus(dto.ids, status);
  }
}
