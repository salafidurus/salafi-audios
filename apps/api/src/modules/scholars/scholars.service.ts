import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarContentDto,
  TranslationViewDto,
} from '@sd/core-contracts';
import { ScholarsRepository } from './scholars.repo';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';
import type { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';
import type { SaveSeriesTranslationDto } from './dto/save-series-translation.dto';
import type { SaveCollectionTranslationDto } from './dto/save-collection-translation.dto';

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

  async getContent(slug: string): Promise<ScholarContentDto> {
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

  publishTranslation(
    scholarId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    return this.repo.publishScholarTranslation(scholarId, locale);
  }

  unpublishTranslation(
    scholarId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
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

  publishSeriesTranslation(
    seriesId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    return this.repo.publishSeriesTranslation(seriesId, locale);
  }

  unpublishSeriesTranslation(
    seriesId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    return this.repo.unpublishSeriesTranslation(seriesId, locale);
  }

  // ─── Collection translations ──────────────────────────────────────────────

  listCollectionTranslations(
    collectionId: string,
  ): Promise<TranslationViewDto[]> {
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

  publishCollectionTranslation(
    collectionId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    return this.repo.publishCollectionTranslation(collectionId, locale);
  }

  unpublishCollectionTranslation(
    collectionId: string,
    locale: string,
  ): Promise<TranslationViewDto> {
    return this.repo.unpublishCollectionTranslation(collectionId, locale);
  }
}
