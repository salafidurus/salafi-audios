import { Injectable, NotFoundException } from '@nestjs/common';
import { ScholarRepository } from './scholars.repo';
import { UpsertScholarDto } from './dto/upsert-scholar.dto';
import { ScholarViewDto } from './dto/scholar-view.dto';
import { ScholarDetailDto } from './dto/scholar-detail.dto';

@Injectable()
export class ScholarService {
  constructor(private readonly repo: ScholarRepository) {}

  async upsertScholar(dto: UpsertScholarDto): Promise<ScholarDetailDto> {
    return this.repo.upsertBySlug(dto);
  }

  async getActiveScholarBySlug(slug: string): Promise<ScholarDetailDto> {
    const scholar = await this.repo.findActiveDetailBySlug(slug);

    if (!scholar) {
      throw new NotFoundException(`Scholar "${slug}" not found`);
    }

    return scholar;
  }

  async listActiveScholars(): Promise<ScholarViewDto[]> {
    return this.repo.listActive();
  }
}
