import { Injectable, NotFoundException } from '@nestjs/common';
import { SeriesTopicsRepository } from './series-topics.repo';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';

@Injectable()
export class SeriesTopicsService {
  constructor(private readonly repo: SeriesTopicsRepository) {}

  async list(
    scholarSlug: string,
    seriesSlug: string,
  ): Promise<LectureTopicViewDto[]> {
    const rows = await this.repo.listByScholarAndSeriesSlug(
      scholarSlug,
      seriesSlug,
    );
    if (!rows) throw new NotFoundException('Series not found');
    return rows;
  }

  async attach(
    scholarSlug: string,
    seriesSlug: string,
    topicSlug: string,
  ): Promise<LectureTopicViewDto> {
    const attached = await this.repo.attach(scholarSlug, seriesSlug, topicSlug);
    if (!attached) throw new NotFoundException('Series or topic not found');
    return attached;
  }

  async detach(
    scholarSlug: string,
    seriesSlug: string,
    topicSlug: string,
  ): Promise<{ ok: true }> {
    const ok = await this.repo.detach(scholarSlug, seriesSlug, topicSlug);
    if (!ok) throw new NotFoundException('Series or topic not found');
    return { ok: true };
  }
}
