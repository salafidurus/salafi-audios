import { useQuery, useMutation, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";
import type { HttpClientConfig } from "@/http";
import { configureApiClient, httpClient } from "@/http";
import { endpoints } from "@/endpoints";
import { queryKeys } from "@/query";
import type {
  ScholarStatsDto,
  PlatformStatsDto,
  SearchCatalogParams,
  SearchCatalogResultsDto,
} from "@/types";

// Re-export hooks for convenience
export { useQuery, useMutation };

// Type-safe hook for API calls
export function useApiQuery<TData, TError = Error>(
  key: QueryKey,
  fn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, "queryKey" | "queryFn">,
) {
  return useQuery<TData, TError>({
    queryKey: key,
    queryFn: fn,
    ...options,
  });
}

// Example usage helper for common endpoints
export function useScholar(slug: string) {
  return useApiQuery(queryKeys.scholars.detail(slug), () =>
    httpClient({
      url: `/scholars/${slug}`,
      method: "GET",
    }),
  );
}

export function useScholarStats(slug: string) {
  return useApiQuery(queryKeys.scholars.stats(slug), () =>
    httpClient<ScholarStatsDto>({
      url: `/scholars/${slug}/stats`,
      method: "GET",
    }),
  );
}

export function usePlatformStats() {
  return useApiQuery(queryKeys.analytics.stats(), () =>
    httpClient<PlatformStatsDto>({
      url: `/analytics/stats`,
      method: "GET",
    }),
  );
}

export function useCatalogSearch(
  params: SearchCatalogParams,
  options?: Parameters<typeof useQuery<SearchCatalogResultsDto, Error>>[0],
) {
  return useApiQuery(
    queryKeys.search.catalog(params),
    () =>
      httpClient<SearchCatalogResultsDto>({
        url: endpoints.search.extended,
        method: "GET",
        params,
      }),
    options,
  );
}

// Initialize hook (must be called in app startup)
export function initApiClient(config: HttpClientConfig) {
  configureApiClient(config);
}
