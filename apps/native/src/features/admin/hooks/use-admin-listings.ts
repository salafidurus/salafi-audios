import type { AdminListingListDto } from "@sd/core-contracts";

import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";

/** Provides authenticated native administration workflows and their data boundaries. */
/** Records the lifecycle state used to decide which transition or UI state is valid. */
/** Provides admin listings state and behavior to native consumers. */
export function useAdminListings(params?: {
  scholarId?: string;
  /** Records the lifecycle state used to decide which transition or UI state is valid. */
  status?: string;
  page?: number;
}) {
  return useApiQuery<AdminListingListDto>(["admin", "listings", params], () =>
    httpClient<AdminListingListDto>({
      url: endpoints.admin.listings.list,
      method: "GET",
      params: {
        scholarId: params?.scholarId,
        status: params?.status,
        page: params?.page,
      },
    }),
  );
}
