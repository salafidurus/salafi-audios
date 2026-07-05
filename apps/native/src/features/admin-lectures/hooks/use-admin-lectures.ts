import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminListingListDto } from "@sd/core-contracts";

export function useAdminLectures(params?: { scholarId?: string; status?: string; page?: number }) {
  return useApiQuery<AdminListingListDto>(["admin", "lectures", params], () =>
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
