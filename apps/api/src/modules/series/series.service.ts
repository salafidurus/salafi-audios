import { Injectable, NotFoundException } from '@nestjs/common';
import { SeriesRepository } from './series.repo';
import { SeriesViewDto } from './dto/series-view.dto';
import { UpsertSeriesDto } from './dto/upsert-series.dto';

@Injectable()
export class SeriesService {
  constructor(private readonly repo: SeriesRepository) {}

  listPublished(scholarSlug: string): Promise<SeriesViewDto[]> {
    return this.repo.listPublishedByScholarSlug(scholarSlug);
  }

  async getPublished(
    scholarSlug: string,
    slug: string,
  ): Promise<SeriesViewDto> {
    const found = await this.repo.findPublishedByScholarSlugAndSlug(
      scholarSlug,
      slug,
    );
    if (!found) throw new NotFoundException(`Series "${slug}" not found`);
    return found;
  }

  async getPublishedById(id: string): Promise<SeriesViewDto> {
    const found = await this.repo.findPublishedById(id);
    if (!found) {
      throw new NotFoundException('Series not found');
    }
    return found;
  }

  async upsert(
    scholarSlug: string,
    dto: UpsertSeriesDto,
  ): Promise<SeriesViewDto> {
    const result = await this.repo.upsertByScholarSlug(scholarSlug, dto);
    if (!result)
      throw new NotFoundException(
        `Scholar "${scholarSlug}" (or parent collection) not found`,
      );
    return result;
  }

  async listPublishedForCollection(
    scholarSlug: string,
    collectionSlug: string,
  ): Promise<SeriesViewDto[]> {
    const result = await this.repo.listPublishedByScholarAndCollectionSlug(
      scholarSlug,
      collectionSlug,
    );

    if (!result) {
      throw new NotFoundException('Collection not found');
    }

    return result;
  }
}
