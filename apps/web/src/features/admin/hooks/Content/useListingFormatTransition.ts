import { useQuery } from "@tanstack/react-query";
import type { AdminListingFormatTransitionDto } from "@sd/core-contracts";
import { queryKeys, httpClient, endpoints } from "@sd/core-contracts";

export function useListingFormatTransition(listingId?: string) {
  return useQuery<AdminListingFormatTransitionDto | null>({
    queryKey: listingId ? queryKeys.admin.listings.formatTransition(listingId) : ["disabled"],
    queryFn: async () => {
      if (!listingId) return null;
      return httpClient<AdminListingFormatTransitionDto>({
        url: endpoints.admin.listings.formatTransition(listingId),
        method: "GET",
      });
    },
    enabled: !!listingId,
  });
}
