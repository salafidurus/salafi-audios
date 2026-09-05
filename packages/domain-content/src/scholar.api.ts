import type { QueryClient, UseQueryOptions } from "@tanstack/react-query";

import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ScholarDetailDto,
  type ScholarDetailStats,
  type ScholarContentItemDto,
  type ScholarContentUnifiedDto,
  type ScholarTopicsDto,
  parseScholarPageFeedDto,
  type ScholarPageFeedDto,
  type ScholarListDto,
  type Locale,
} from "@sd/core-contracts";

/** Query hooks and presentation grouping for public scholar catalog content. */
type SplitScholarContentResult = {
  featured: ScholarContentItemDto | undefined;
  recommended: ScholarContentItemDto[];
  browse: ScholarContentItemDto[];
};

/** Reads the flat active-scholar directory used by non-feed catalog consumers. */
export function useScholarDirectory(
  options?: Omit<UseQueryOptions<ScholarListDto, Error, ScholarListDto>, "queryKey" | "queryFn">,
  queryClient?: QueryClient,
) {
  return useApiQuery(
    queryKeys.scholars.directory(),
    () =>
      httpClient<ScholarListDto>({
        url: endpoints.scholars.directory,
        method: "GET",
      }),
    options,
    queryClient,
  );
}

/**
 * Reads one locale-specific, recommendation-composed root Scholars page.
 *
 * The cursor is opaque continuation state returned by the API and is included
 * in both the request and the React Query cache key.
 */
export function useScholarPageFeeds(
  locale: Locale = "en",
  cursor?: string,
  options?: Omit<UseQueryOptions<ScholarPageFeedDto>, "queryKey" | "queryFn">,
) {
  return useApiQuery(
    queryKeys.scholars.pageFeed(locale, cursor),
    async () => {
      const response = await httpClient<unknown>({
        url: endpoints.scholars.pageFeed,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      });
      return parseScholarPageFeedDto(response);
    },
    options,
  );
}

/** Searches active scholars through the backend-owned public scholar search boundary. */
export function useScholarSearch(
  query: string,
  options?: Omit<UseQueryOptions<ScholarListDto>, "queryKey" | "queryFn">,
) {
  const normalizedQuery = query.trim();
  return useApiQuery(
    queryKeys.scholars.search(normalizedQuery),
    () =>
      httpClient<ScholarListDto>({
        url: endpoints.scholars.search,
        method: "GET",
        params: { q: normalizedQuery },
      }),
    { enabled: normalizedQuery.length > 0, ...options },
  );
}

/** Reads one scholar by its public, locale-independent slug. */
export function useScholarDetail(slug: string) {
  return useApiQuery(
    queryKeys.scholars.detail(slug),
    () =>
      httpClient<ScholarDetailDto & ScholarDetailStats>({
        url: endpoints.scholars.detail(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}

/** Reads the API-composed Catalog content associated with a scholar slug. */
export function useScholarContent(
  slug: string,
  options?: Omit<
    UseQueryOptions<ScholarContentUnifiedDto, Error, ScholarContentUnifiedDto>,
    "queryKey" | "queryFn"
  >,
) {
  return useApiQuery(
    queryKeys.scholars.content(slug),
    () =>
      httpClient<ScholarContentUnifiedDto>({
        url: endpoints.scholars.content(slug),
        method: "GET",
      }),
    { enabled: !!slug, ...options },
  );
}

/** Splits scholar content into featured, recommended, and browse sections. */
export function splitScholarContent(
  items: ScholarContentItemDto[],
  recommendedCount = 4,
): SplitScholarContentResult {
  return {
    featured: items[0],
    recommended: items.slice(1, 1 + recommendedCount),
    browse: items.slice(1 + recommendedCount),
  };
}

/** Reads the public topics associated with a scholar slug. */
export function useScholarTopics(slug: string) {
  return useApiQuery(
    queryKeys.scholars.topics(slug),
    () =>
      httpClient<ScholarTopicsDto>({
        url: endpoints.scholars.topics(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}
