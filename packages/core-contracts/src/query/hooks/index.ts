import {
  useQuery,
  type QueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

import type { HttpClientConfig } from "../../http";

import { configureApiClient } from "../../http";

/** React Query hooks and client initialization helpers built on shared API contracts. */
/** Runs a typed API query with shared retry and cache defaults. */
export function useApiQuery<TData, TError = Error>(
  key: QueryKey,
  fn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, "queryKey" | "queryFn"> & {
    queryClient?: QueryClient;
  },
  queryClient?: QueryClient,
) {
  const { queryClient: optionsQueryClient, ...queryOptions } = options ?? {};
  const client = queryClient ?? optionsQueryClient;
  return useQuery<TData, TError>(
    {
      queryKey: key,
      queryFn: fn,
      retry: 1,
      staleTime: 30_000,
      ...queryOptions,
    },
    client,
  );
}

/** Installs the shared HTTP client configuration used by query functions. */
export function initApiClient(config: HttpClientConfig) {
  configureApiClient(config);
}
