import type { AdminListingListDto } from "@sd/core-contracts";

import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";

export function useAdminListings(params?: { scholarId?: string; status?: string; page?: number }) {
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
