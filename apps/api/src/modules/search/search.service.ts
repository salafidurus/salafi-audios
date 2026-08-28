import { Injectable } from '@nestjs/common';
import type { SearchCatalogResultsDto } from '@sd/core-contracts';
import { SearchRepository } from './search.repo';
import { SearchQueryDto } from './dto/search-query.dto';

/** search application module responsible for search.service behavior at the backend boundary. */
const DEFAULT_SEARCH_LIMIT = 12;
const MAX_SEARCH_LIMIT = 30;

@Injectable()
/** NestJS search service service or controller coordinating the API boundary for this responsibility. */
export class SearchService {
  constructor(private readonly repo: SearchRepository) {}

  async search(query: SearchQueryDto): Promise<SearchCatalogResultsDto> {
    return this.searchByMode(query, false);
  }

  async searchExtended(query: SearchQueryDto): Promise<SearchCatalogResultsDto> {
    return this.searchByMode(query, true);
  }

  private async searchByMode(
    query: SearchQueryDto,
    includeRelated: boolean,
  ): Promise<SearchCatalogResultsDto> {
    const trimmed = query.q?.trim() ? query.q.trim() : undefined;
    const limit = Math.min(query.limit ?? DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT);
    const listQuery: SearchQueryDto = {
      q: trimmed,
      limit,
      language: query.language,
      topicSlug: query.topicSlug,
      topicSlugs: query.topicSlugs,
      scholarSlug: query.scholarSlug,
      format: query.format,
    };

    const { collections, series, singles } = await this.repo.searchListings(
      listQuery,
      limit,
      includeRelated,
    );

    return {
      collections,
      series,
      singles,
      hasMore: false,
    };
  }
}
