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
  type ScholarListItemDto,
  type ScholarTopicsDto,
} from "@sd/core-contracts";

/** Query hooks and presentation grouping for public scholar catalog content. */
type SplitScholarContentResult = {
  featured: ScholarContentItemDto | undefined;
  recommended: ScholarContentItemDto[];
  browse: ScholarContentItemDto[];
};

/** Reads the public scholar list, optionally using a supplied query client. */
export function useScholarsList(
  options?: Omit<
    UseQueryOptions<{ scholars: ScholarListItemDto[] }, Error, { scholars: ScholarListItemDto[] }>,
    "queryKey" | "queryFn"
  >,
  queryClient?: QueryClient,
) {
  return useApiQuery(
    queryKeys.scholars.list.all(),
    () =>
      httpClient<{ scholars: ScholarListItemDto[] }>({
        url: endpoints.scholars.list,
        method: "GET",
      }),
    options,
    queryClient,
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
