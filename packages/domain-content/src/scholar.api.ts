import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ScholarDetailDto,
  type ScholarContentUnifiedDto,
  type ScholarListItemDto,
  type ScholarTopicsDto,
} from "@sd/core-contracts";
import type { UseQueryOptions } from "@tanstack/react-query";

export function useScholarsList() {
  return useApiQuery(queryKeys.scholars.list.all(), () =>
    httpClient<{ scholars: ScholarListItemDto[] }>({
      url: endpoints.scholars.list,
      method: "GET",
    }),
  );
}

export function useScholarDetail(slug: string) {
  return useApiQuery(
    queryKeys.scholars.detail(slug),
    () =>
      httpClient<
        ScholarDetailDto & {
          lectureCount: number;
          seriesCount: number;
          totalDurationSeconds: number;
        }
      >({
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
