import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminListingListItemDto } from "@sd/core-contracts";

export function useAdminSeries(scholarId: string) {
  return useApiQuery<AdminListingListItemDto[]>(["admin", "series", scholarId], () =>
    httpClient<AdminListingListItemDto[]>({
      url: endpoints.admin.listings.list,
      method: "GET",
      params: { scholarId, format: "series" },
    }),
  );
}

export function useAdminCollections(scholarId: string) {
  return useApiQuery<AdminListingListItemDto[]>(["admin", "collections", scholarId], () =>
    httpClient<AdminListingListItemDto[]>({
      url: endpoints.admin.listings.list,
      method: "GET",
      params: { scholarId, format: "collection" },
    }),
  );
}
