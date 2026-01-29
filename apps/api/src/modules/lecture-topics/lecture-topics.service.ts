import { Injectable, NotFoundException } from '@nestjs/common';
import { LectureTopicsRepository } from './lecture-topics.repo';
import { LectureTopicViewDto } from './dto/lecture-topic-view.dto';

@Injectable()
export class LectureTopicsService {
  constructor(private readonly repo: LectureTopicsRepository) {}

  async list(
    scholarSlug: string,
    lectureSlug: string,
  ): Promise<LectureTopicViewDto[]> {
    const rows = await this.repo.listByScholarAndLectureSlug(
      scholarSlug,
      lectureSlug,
    );
    if (!rows) throw new NotFoundException('Lecture not found');
    return rows;
  }

  async attach(
    scholarSlug: string,
    lectureSlug: string,
    topicSlug: string,
  ): Promise<LectureTopicViewDto> {
    const attached = await this.repo.attach(
      scholarSlug,
      lectureSlug,
      topicSlug,
    );
    if (!attached) throw new NotFoundException('Lecture or topic not found');
    return attached;
  }

  async detach(
    scholarSlug: string,
    lectureSlug: string,
    topicSlug: string,
  ): Promise<{ ok: true }> {
    const result = await this.repo.detach(scholarSlug, lectureSlug, topicSlug);
    if (!result) throw new NotFoundException('Lecture or topic not found');
    return { ok: true };
  }
}
