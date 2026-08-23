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

type SplitScholarContentResult = {
  featured: ScholarContentItemDto | undefined;
  recommended: ScholarContentItemDto[];
  browse: ScholarContentItemDto[];
};

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
