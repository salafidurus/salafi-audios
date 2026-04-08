import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type QuickBrowseDto,
} from "@sd/core-contracts";

export function useQuickBrowse() {
  return useApiQuery<QuickBrowseDto>(queryKeys.home.quickbrowse(), () =>
    httpClient<QuickBrowseDto>({
      url: endpoints.home.quickbrowse,
      method: "GET",
    }),
  );
}
