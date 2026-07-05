import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ListingDetailDto,
} from "@sd/core-contracts";

export function useListingDetail(id: string) {
  return useApiQuery(
    queryKeys.listings.detail(id, id),
    () =>
      httpClient<ListingDetailDto>({
        url: endpoints.listings.detail(id),
        method: "GET",
      }),
    { enabled: !!id },
  );
}
