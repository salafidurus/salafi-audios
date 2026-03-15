import { Injectable } from '@nestjs/common';
import type { SearchCatalogResultsDto } from '@sd/contracts';
import { SearchRepository } from './search.repo';
import { SearchQueryDto } from './dto/search-query.dto';

const DEFAULT_SEARCH_LIMIT = 12;
const MAX_SEARCH_LIMIT = 30;

@Injectable()
export class SearchService {
  constructor(private readonly repo: SearchRepository) {}

  async search(query: SearchQueryDto): Promise<SearchCatalogResultsDto> {
    return this.searchByMode(query, false);
  }

  async searchExtended(
    query: SearchQueryDto,
  ): Promise<SearchCatalogResultsDto> {
    return this.searchByMode(query, true);
  }

  private async searchByMode(
    query: SearchQueryDto,
    includeRelated: boolean,
  ): Promise<SearchCatalogResultsDto> {
    const trimmed = query.q?.trim();
    if (!trimmed) {
      return { collections: [], series: [], lectures: [] };
    }

    const limit = Math.min(
      query.limit ?? DEFAULT_SEARCH_LIMIT,
      MAX_SEARCH_LIMIT,
    );
    const listQuery: SearchQueryDto = {
      q: trimmed,
      limit,
      language: query.language,
      topicSlug: query.topicSlug,
      topicSlugs: query.topicSlugs,
      scholarSlug: query.scholarSlug,
    };

    const [collections, series, lectures] = await Promise.all([
      this.repo.listCollections(listQuery, limit, includeRelated),
      this.repo.listRootSeries(listQuery, limit, includeRelated),
      this.repo.listRootLectures(listQuery, limit, includeRelated),
    ]);

    return {
      collections,
      series,
      lectures,
    };
  }
}
