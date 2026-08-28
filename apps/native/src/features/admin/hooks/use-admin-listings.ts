import type { AdminListingListDto } from "@sd/core-contracts";

import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";

/** Provides the native features admin hooks use-admin-listings module responsibility. */
/** Describes the status native field contract and behavior. */
/** Describes the useAdminListings native function contract and behavior. */
export function useAdminListings(params?: {
  scholarId?: string;
  /** Describes the status native field contract and behavior. */
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
