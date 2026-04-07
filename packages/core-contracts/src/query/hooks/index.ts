import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";
import type { HttpClientConfig } from "../../http";
import { configureApiClient, httpClient } from "../../http";
import { endpoints } from "../../endpoints";
import { queryKeys } from "../../query";
import type { SearchCatalogResultsDto } from "../../types";

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

export function initApiClient(config: HttpClientConfig) {
  configureApiClient(config);
}
