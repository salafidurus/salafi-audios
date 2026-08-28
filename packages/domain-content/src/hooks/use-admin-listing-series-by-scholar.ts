import {
  useApiQuery,
  httpClient,
  endpoints,
  queryKeys,
  type ListingRefDto,
} from "@sd/core-contracts";

/**
 * Fetch series-format listings for a given scholar, optimized via a dedicated
 * backend endpoint (minimal columns, no pagination).
 */
/** Reads the series Listings associated with an admin-selected scholar. */
export function useAdminListingSeriesByScholar(scholarId?: string) {
  return useApiQuery<ListingRefDto[]>(queryKeys.admin.listings.series(scholarId), () =>
    scholarId
      ? httpClient<ListingRefDto[]>({
          url: `${endpoints.admin.listings.series}?scholarId=${scholarId}`,
          method: "GET",
        })
      : Promise.resolve([]),
  );
}
