import {
  useQuery,
  type QueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { HttpClientConfig } from "../../http";
import { configureApiClient } from "../../http";

export function useApiQuery<TData, TError = Error>(
  key: QueryKey,
  fn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, "queryKey" | "queryFn"> & {
    queryClient?: QueryClient;
  },
  queryClient?: QueryClient,
) {
  const client = queryClient ?? (options as { queryClient?: QueryClient })?.queryClient;
  return useQuery<TData, TError>(
    {
      queryKey: key,
      queryFn: fn,
      retry: 1,
      staleTime: 30_000,
      ...options,
    },
    client,
  );
}

export function initApiClient(config: HttpClientConfig) {
  configureApiClient(config);
}
