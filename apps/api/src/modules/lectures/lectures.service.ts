import { Injectable, NotFoundException } from '@nestjs/common';
import type { LectureDetailDto } from '@sd/core-contracts';
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
}
