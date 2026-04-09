import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ScholarDetailDto,
  type ScholarContentDto,
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
      httpClient<ScholarContentDto>({
        url: endpoints.scholars.content(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}
