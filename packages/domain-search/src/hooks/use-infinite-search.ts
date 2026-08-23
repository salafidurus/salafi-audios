import { httpClient, endpoints, queryKeys, type SearchCatalogResultsDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

import { buildSearchResultRows } from "../utils/build-search-result-rows";

export interface UseInfiniteSearchOptions {
  query?: string;
  scholarSlug?: string;
  language?: string;
  showOriginal?: boolean;
  enabled?: boolean;
  topicSlugs?: string[];
  format?: string;
  limit?: number;
}

export function useInfiniteSearch(options: UseInfiniteSearchOptions) {
  const initialPageParam: string | undefined = undefined;

  const params = {
    q: options.query?.trim() ? options.query.trim() : undefined,
    scholarSlug: options.scholarSlug,
    format: options.format,
    language: options.language,
    limit: options.limit,
    topicSlugs: options.topicSlugs,
  };

  return useInfiniteQuery({
    queryKey: queryKeys.search.infinite(params),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      // API returns full list (non-paginated), only fetch on first page
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const response = await httpClient<SearchCatalogResultsDto>({
        url: endpoints.search.extended,
        method: "GET",
        params,
      });
      const rows = buildSearchResultRows(response, options.showOriginal ?? false);

      return {
        items: rows,
        nextCursor: undefined,
        hasMore: false,
      };
    },
    initialPageParam,
    getNextPageParam: () => undefined,
    enabled: options.enabled !== false,
  });
}
