import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { LectureDetailDto, RelatedLectureDto, AdminLectureUpdateDto, AdminLectureActionDto } from '@sd/core-contracts';
import { Status } from '@sd/core-db';
import { LecturesRepository } from './lectures.repo';

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

  async updateLecture(id: string, updateDto: AdminLectureUpdateDto): Promise<AdminLectureActionDto> {
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
}
