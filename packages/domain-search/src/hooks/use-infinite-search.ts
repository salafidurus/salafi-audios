import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type SearchCatalogResultsDto } from "@sd/core-contracts";
import { buildSearchResultRows, type SearchResultRow } from "../utils/build-search-result-rows";

export interface UseInfiniteSearchOptions {
  query: string;
  showOriginal?: boolean;
  enabled?: boolean;
}

export function useInfiniteSearch(options: UseInfiniteSearchOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.search.infinite(options.query),
    queryFn: async ({ pageParam }) => {
      if (!options.query.trim()) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const params = new URLSearchParams();
      params.append("q", options.query);
      if (pageParam) params.append("cursor", pageParam);

      const url = `/api/search?${params}`;
      const response = await httpClient<SearchCatalogResultsDto>({ url, method: "GET" });
      const rows = buildSearchResultRows(response, options.showOriginal ?? false);

      return {
        items: rows,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore ?? false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: options.enabled !== false && !!options.query.trim(),
  });
}
