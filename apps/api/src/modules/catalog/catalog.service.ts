import { Injectable } from '@nestjs/common';
import { CatalogRepository } from './catalog.repo';
import { CatalogListQueryDto } from './dto/catalog-list.query.dto';
import { CatalogSearchQueryDto } from './dto/catalog-search.query.dto';
import { CatalogPageDto } from './dto/catalog-page.dto';
import type {
  CollectionViewDto,
  CatalogSearchResultsDto,
  SeriesViewDto,
  LectureViewDto,
} from '@sd/contracts';

const DEFAULT_SEARCH_LIMIT = 12;
const MAX_SEARCH_LIMIT = 30;

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

  async search(query: CatalogSearchQueryDto): Promise<CatalogSearchResultsDto> {
    const trimmed = query.q?.trim();
    if (!trimmed) {
      return { collections: [], series: [], lectures: [] };
    }

    const limit = Math.min(
      query.limit ?? DEFAULT_SEARCH_LIMIT,
      MAX_SEARCH_LIMIT,
    );
    const listQuery: CatalogListQueryDto = {
      q: trimmed,
      limit,
      language: query.language,
      topicSlug: query.topicSlug,
      scholarSlug: query.scholarSlug,
    };

    const [collections, series, lectures] = await Promise.all([
      this.repo.listCollections(listQuery),
      this.repo.listRootSeries(listQuery),
      this.repo.listRootLectures(listQuery),
    ]);

    return {
      collections: collections.items,
      series: series.items,
      lectures: lectures.items,
    };
  }
}
