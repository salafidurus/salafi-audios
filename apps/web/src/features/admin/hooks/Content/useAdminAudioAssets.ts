import { useQuery } from "@tanstack/react-query";
import type { AudioAssetViewDto } from "@sd/core-contracts";
import { queryKeys, httpClient, endpoints } from "@sd/core-contracts";

export function useAdminAudioAssets(listingId?: string) {
  return useQuery<AudioAssetViewDto[]>({
    queryKey: listingId ? queryKeys.admin.listings.audioAssets(listingId) : ["disabled"],
    queryFn: async () => {
      if (!listingId) return [];
      return httpClient<AudioAssetViewDto[]>({
        url: endpoints.admin.listings.audioAssets.list(listingId),
        method: "GET",
      });
    },
    enabled: !!listingId,
  });
}
