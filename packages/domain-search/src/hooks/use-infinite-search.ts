import { httpClient, endpoints, queryKeys, type SearchCatalogResultsDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

import { buildSearchResultRows } from "../utils/build-search-result-rows";

/** Adapts the non-paginated catalog search endpoint to an infinite-query seam. */
/** Discovery filters and presentation options for catalog search. */
export interface UseInfiniteSearchOptions {
  query?: string;
  /** Uses the scholar's public, locale-independent identity as a filter. */
  scholarSlug?: string;
  /** Selects the requested translation language for returned content. */
  language?: string;
  showOriginal?: boolean;
  enabled?: boolean;
  /** Narrows results by public topic identities. */
  topicSlugs?: string[];
  format?: string;
  limit?: number;
}

/** Searches published Listings and exposes the result as one query page. */
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
