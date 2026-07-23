import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarContentUnifiedDto,
  ScholarTopicsDto,
  TranslationViewDto,
  AdminScholarListDto,
  Locale,
} from '@sd/core-contracts';
import { ScholarsRepository } from './scholars.repo';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';
import type { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';

@Injectable()
export class ScholarsService {
  constructor(private readonly repo: ScholarsRepository) {}

  list(): Promise<{ scholars: ScholarListItemDto[] }> {
    return this.repo.list();
  }

  adminList(cursor?: string): Promise<AdminScholarListDto> {
    return this.repo.adminList(cursor);
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

  async getTopics(slug: string): Promise<ScholarTopicsDto> {
    const topics = await this.repo.getTopics(slug);
    if (!topics) throw new NotFoundException(`Scholar "${slug}" not found`);
    return topics;
  }

  async create(dto: CreateScholarDto) {
    const scholar = await this.repo.create(dto);

    // If translations were provided in the DTO, upsert them
    if (dto.translations && scholar.id) {
      for (const [locale, fields] of Object.entries(dto.translations)) {
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        await this.upsertTranslation(scholar.id, {
          locale: locale as Locale,
          name: fields.name,
        } as SaveScholarTranslationDto);
      }
    }

    return scholar;
  }

  async update(id: string, dto: UpdateScholarDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Scholar "${id}" not found`);
    const updated = await this.repo.update(id, dto);

    // If translations were provided in the DTO, upsert them
    if (dto.translations && id) {
      for (const [locale, fields] of Object.entries(dto.translations)) {
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        await this.upsertTranslation(id, {
          locale: locale as Locale,
          name: fields.name,
        } as SaveScholarTranslationDto);
      }
    }

    return updated;
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
}
