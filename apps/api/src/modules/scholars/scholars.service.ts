import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ScholarListItemDto,
  ScholarDetailDto,
  ScholarContentDto,
} from '@sd/core-contracts';
import { ScholarsRepository } from './scholars.repo';
import type { CreateScholarDto } from './dto/create-scholar.dto';
import type { UpdateScholarDto } from './dto/update-scholar.dto';

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
}
