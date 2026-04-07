import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ScholarDetailDto,
  type ScholarStatsDto,
  type ScholarViewDto,
  type CollectionViewDto,
  type SeriesViewDto,
} from "@sd/core-contracts";

export function useScholarsList() {
  return useApiQuery(queryKeys.scholars.list(), () =>
    httpClient<ScholarViewDto[]>({
      url: endpoints.scholars.list,
      method: "GET",
    }),
  );
}

export function useScholarDetail(slug: string) {
  return useApiQuery(
    queryKeys.scholars.detail(slug),
    () =>
      httpClient<ScholarDetailDto>({
        url: endpoints.scholars.detail(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}

export function useScholarStats(slug: string) {
  return useApiQuery(
    queryKeys.scholars.stats(slug),
    () =>
      httpClient<ScholarStatsDto>({
        url: endpoints.scholars.stats(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}

export function useCollectionDetail(id: string) {
  return useApiQuery(
    queryKeys.collections.detail(id, id),
    () =>
      httpClient<CollectionViewDto>({
        url: endpoints.collections.detail(id),
        method: "GET",
      }),
    { enabled: !!id },
  );
}

export function useSeriesDetail(id: string) {
  return useApiQuery(
    queryKeys.series.detail(id, id),
    () =>
      httpClient<SeriesViewDto>({
        url: endpoints.series.detail(id),
        method: "GET",
      }),
    { enabled: !!id },
  );
}
