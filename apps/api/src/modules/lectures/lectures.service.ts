import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  LectureDetailDto,
  RelatedLectureDto,
  AdminLectureUpdateDto,
  AdminLectureActionDto,
  AdminLectureListDto,
  AdminLectureDetailDto,
  BulkActionDto,
  BulkActionResultDto,
  TranslationViewDto,
} from '@sd/core-contracts';
import { Status } from '@sd/core-db';
import { LecturesRepository } from './lectures.repo';
import type { SaveLectureTranslationDto } from './dto/save-lecture-translation.dto';
import type { CreateLectureDto } from './dto/create-lecture.dto';

@Injectable()
export class LecturesService {
  constructor(private readonly repo: LecturesRepository) {}

  async getById(id: string): Promise<LectureDetailDto> {
    const lecture = await this.repo.findDetailById(id);
    if (!lecture) {
      throw new NotFoundException(`Lecture "${id}" not found`);
    }
    return lecture;
  }

  async getRelated(id: string): Promise<RelatedLectureDto[]> {
    const related = await this.repo.findRelated(id);
    return related;
  }

  async updateLecture(
    id: string,
    updateDto: AdminLectureUpdateDto,
  ): Promise<AdminLectureActionDto> {
    const updated = await this.repo.updateLecture(id, updateDto);
    if (!updated) {
      throw new NotFoundException(`Lecture "${id}" not found`);
    }
    return { success: true, message: 'Lecture updated successfully' };
  }

  async publishLecture(id: string): Promise<AdminLectureActionDto> {
    const published = await this.repo.updateLectureStatus(id, Status.published);
    if (!published) {
      throw new NotFoundException(`Lecture "${id}" not found`);
    }
    return { success: true, message: 'Lecture published successfully' };
  }

  async archiveLecture(id: string): Promise<AdminLectureActionDto> {
    const archived = await this.repo.updateLectureStatus(id, Status.archived);
    if (!archived) {
      throw new NotFoundException(`Lecture "${id}" not found`);
    }
    return { success: true, message: 'Lecture archived successfully' };
  }

  // ─── Admin methods ────────────────────────────────────────────────────────

  async listAdmin(params: {
    page: number;
    scholarId?: string;
    status?: string;
    search?: string;
  }): Promise<AdminLectureListDto> {
    return this.repo.listAdmin(params);
  }

  async getAdminDetail(id: string): Promise<AdminLectureDetailDto> {
    const lecture = await this.repo.findAdminDetail(id);
    if (!lecture) throw new NotFoundException(`Lecture "${id}" not found`);
    return lecture;
  }

  async createLecture(
    dto: CreateLectureDto & { publicUrl: string },
  ): Promise<{ id: string; title: string }> {
    return this.repo.createWithAudioAsset(dto);
  }

  async bulkAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
    const status = dto.action === 'publish' ? Status.published : Status.archived;
    return this.repo.bulkUpdateStatus(dto.ids, status);
  }

  // ─── Lecture translations ─────────────────────────────────────────────────

  listTranslations(lectureId: string): Promise<TranslationViewDto[]> {
    return this.repo.listLectureTranslations(lectureId);
  }

  upsertTranslation(
    lectureId: string,
    dto: SaveLectureTranslationDto,
  ): Promise<TranslationViewDto> {
    return this.repo.upsertLectureTranslation(lectureId, dto);
  }

  updateTranslation(
    lectureId: string,
    locale: string,
    fields: Partial<{ title: string; description: string | null }>,
  ): Promise<TranslationViewDto> {
    return this.repo.updateLectureTranslation(lectureId, locale, fields);
  }

  publishTranslation(lectureId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.publishLectureTranslation(lectureId, locale);
  }

  unpublishTranslation(lectureId: string, locale: string): Promise<TranslationViewDto> {
    return this.repo.unpublishLectureTranslation(lectureId, locale);
  }
}
