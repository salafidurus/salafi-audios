import type { AdminListingListItemDto } from "@sd/core-contracts";

import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";

/** Describes the useAdminSeries native contract and behavior. */
/** Describes the useAdminSeries native function contract and behavior. */
export function useAdminSeries(scholarId: string) {
  return useApiQuery<AdminListingListItemDto[]>(["admin", "series", scholarId], () =>
    httpClient<AdminListingListItemDto[]>({
      url: endpoints.admin.listings.list,
      method: "GET",
      params: { scholarId, format: "series" },
    }),
  );
}

/** Describes the useAdminCollections native contract and behavior. */
export function useAdminCollections(scholarId: string) {
  return useApiQuery<AdminListingListItemDto[]>(["admin", "collections", scholarId], () =>
    httpClient<AdminListingListItemDto[]>({
      url: endpoints.admin.listings.list,
      method: "GET",
      params: { scholarId, format: "collection" },
    }),
  );
}
