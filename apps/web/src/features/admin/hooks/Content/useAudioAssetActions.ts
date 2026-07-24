import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys } from "@sd/core-contracts";
import type { AudioAssetViewDto } from "@sd/core-contracts";

export interface AddAudioAssetDto {
  audioKey: string;
  durationSeconds?: number;
  sizeBytes?: number;
  format?: string;
}

export function useAudioAssetActions(listingId: string) {
  const queryClient = useQueryClient();

  const addAsset = useMutation({
    mutationFn: async (dto: AddAudioAssetDto) => {
      return httpClient<AudioAssetViewDto>({
        url: endpoints.admin.listings.audioAssets.add(listingId),
        method: "POST",
        body: dto,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.listings.audioAssets(listingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.listings.formatTransition(listingId),
      });
    },
  });

  const promoteAsset = useMutation({
    mutationFn: async (assetId: string) => {
      return httpClient<void>({
        url: endpoints.admin.listings.audioAssets.promote(listingId, assetId),
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.listings.audioAssets(listingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.listings.formatTransition(listingId),
      });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (assetId: string) => {
      return httpClient<void>({
        url: endpoints.admin.listings.audioAssets.delete(listingId, assetId),
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.listings.audioAssets(listingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.listings.formatTransition(listingId),
      });
    },
  });

  return { addAsset, promoteAsset, deleteAsset };
}
