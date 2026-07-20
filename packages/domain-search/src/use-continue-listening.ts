import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type QuickBrowseDto,
} from "@sd/core-contracts";

export function useContinueListening() {
  const query = useApiQuery<QuickBrowseDto>(queryKeys.home.quickbrowse(), () =>
    httpClient<QuickBrowseDto>({
      url: endpoints.home.quickbrowse,
      method: "GET",
    }),
  );

  return { ...query, recentProgress: query.data?.recentProgress ?? null };
}
