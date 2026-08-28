import type { AdminListingListItemDto } from "@sd/core-contracts";

import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";

/** Exposes admin series state and actions to native consumers. */
/** Provides admin series state and behavior to native consumers. */
export function useAdminSeries(scholarId: string) {
  return useApiQuery<AdminListingListItemDto[]>(["admin", "series", scholarId], () =>
    httpClient<AdminListingListItemDto[]>({
      url: endpoints.admin.listings.list,
      method: "GET",
      params: { scholarId, format: "series" },
    }),
  );
}

/** Exposes admin collections state and actions to native consumers. */
export function useAdminCollections(scholarId: string) {
  return useApiQuery<AdminListingListItemDto[]>(["admin", "collections", scholarId], () =>
    httpClient<AdminListingListItemDto[]>({
      url: endpoints.admin.listings.list,
      method: "GET",
      params: { scholarId, format: "collection" },
    }),
  );
}
