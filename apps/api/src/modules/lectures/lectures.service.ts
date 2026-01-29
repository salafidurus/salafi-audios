import { Injectable, NotFoundException } from '@nestjs/common';
import { LecturesRepository } from './lectures.repo';
import { LectureViewDto } from './dto/lecture-view.dto';
import { UpsertLectureDto } from './dto/upsert-lecture.dto';

@Injectable()
export class LecturesService {
  constructor(private readonly repo: LecturesRepository) {}

  listPublished(scholarSlug: string): Promise<LectureViewDto[]> {
    return this.repo.listPublishedByScholarSlug(scholarSlug);
  }

  async getPublished(
    scholarSlug: string,
    slug: string,
  ): Promise<LectureViewDto> {
    const found = await this.repo.findPublishedByScholarSlugAndSlug(
      scholarSlug,
      slug,
    );
    if (!found) throw new NotFoundException(`Lecture "${slug}" not found`);
    return found;
  }

  async getPublishedById(id: string): Promise<LectureViewDto> {
    const found = await this.repo.findPublishedById(id);
    if (!found) {
      throw new NotFoundException('Lecture not found');
    }
    return found;
  }

  async upsert(
    scholarSlug: string,
    dto: UpsertLectureDto,
  ): Promise<LectureViewDto> {
    const result = await this.repo.upsertByScholarSlug(scholarSlug, dto);
    if (!result)
      throw new NotFoundException(
        `Scholar "${scholarSlug}" (or parent series) not found`,
      );
    return result;
  }

  async listPublishedForSeries(
    scholarSlug: string,
    seriesSlug: string,
  ): Promise<LectureViewDto[]> {
    const result = await this.repo.listPublishedByScholarAndSeriesSlug(
      scholarSlug,
      seriesSlug,
    );

    if (!result) {
      throw new NotFoundException('Series not found');
    }

    return result;
  }
}
