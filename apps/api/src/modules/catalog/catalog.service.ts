import { Injectable } from '@nestjs/common';
import { CatalogRepository } from './catalog.repo';
import { CatalogListQueryDto } from './dto/catalog-list.query.dto';
import { CatalogPageDto } from './dto/catalog-page.dto';
import type {
  CollectionViewDto,
  SeriesViewDto,
  LectureViewDto,
} from '@sd/contracts';

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  listCollections(
    query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<CollectionViewDto>> {
    return this.repo.listCollections(query);
  }

  listRootSeries(
    query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<SeriesViewDto>> {
    return this.repo.listRootSeries(query);
  }

  listRootLectures(
    query: CatalogListQueryDto,
  ): Promise<CatalogPageDto<LectureViewDto>> {
    return this.repo.listRootLectures(query);
  }
}
