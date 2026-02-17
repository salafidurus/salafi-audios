import { useQuery, useMutation, type QueryKey } from "@tanstack/react-query";
import type { HttpClientConfig } from "../../http";
import { configureApiClient, httpClient } from "../../http";
import { queryKeys } from "../index";
import type { ScholarStatsDto, PlatformStatsDto } from "../../types";

// Re-export hooks for convenience
export { useQuery, useMutation };

// Type-safe hook for API calls
export function useApiQuery<TData, TError = Error>(
  key: QueryKey,
  fn: () => Promise<TData>,
  options?: Parameters<typeof useQuery<TData, TError>>[0],
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

// Initialize hook (must be called in app startup)
export function initApiClient(config: HttpClientConfig) {
  configureApiClient(config);
}
