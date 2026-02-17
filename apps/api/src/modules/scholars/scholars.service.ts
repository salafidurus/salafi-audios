import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ScholarViewDto,
  ScholarStatsDto,
  ScholarDetailDto,
} from '@sd/contracts';
import { ScholarRepository } from './scholars.repo';
import { UpsertScholarDto } from './dto/upsert-scholar.dto';

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

  async setKibarById(id: string, isKibar: boolean): Promise<ScholarDetailDto> {
    const scholar = await this.repo.updateKibarById(id, isKibar);

    if (!scholar) {
      throw new NotFoundException(`Scholar "${id}" not found`);
    }

    return scholar;
  }

  async getScholarStats(slug: string): Promise<ScholarStatsDto> {
    const scholar = await this.repo.findActiveDetailBySlug(slug);

    if (!scholar) {
      throw new NotFoundException(`Scholar "${slug}" not found`);
    }

    return this.repo.getScholarStats(scholar.id);
  }
}
