import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ScholarDetailDto,
  type ScholarContentItemDto,
  type ScholarContentUnifiedDto,
  type ScholarListItemDto,
} from "@sd/core-contracts";

export function useScholarsList() {
  return useApiQuery(queryKeys.scholars.list(), () =>
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

export function useScholarContent(slug: string) {
  return useApiQuery(
    queryKeys.scholars.content(slug),
    () =>
      httpClient<ScholarContentUnifiedDto>({
        url: endpoints.scholars.content(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}

export function splitScholarContent(
  items: ScholarContentItemDto[],
  recommendedCount = 4,
): {
  featured: ScholarContentItemDto | undefined;
  recommended: ScholarContentItemDto[];
  browse: ScholarContentItemDto[];
} {
  return {
    featured: items[0],
    recommended: items.slice(1, 1 + recommendedCount),
    browse: items.slice(1 + recommendedCount),
  };
}
