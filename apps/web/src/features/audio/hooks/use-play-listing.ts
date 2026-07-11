"use client";

import { useCallback, useState } from "react";
import { useListingDetail } from "@sd/domain-content";
import type { Track } from "@sd/domain-audio";
import { sanitizeError } from "@sd/utils-error";
import { audioService } from "../index";

export type UsePlayListingOptions = {
  /**
   * Optional callback to handle errors. If provided, errors will be passed here
   * instead of being stored in the error state.
   */
  onError?: (message: string) => void;
};

/**
 * Hook to play a listing by ID.
 * Fetches the full listing detail and initiates playback via the audio service.
 *
 * @param listingId - The ID of the listing to play (in format "prefix:id")
 * @param options - Configuration options including error callback
 * @returns Object with play function, loading state, and error state
 */
export function usePlayListing(listingId: string | null, options?: UsePlayListingOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract actual ID if it's in "prefix:id" format
  const actualId = listingId ? listingId.split(":")[1] || listingId : null;

  // Fetch the full listing detail to get the stream URL
  const { data: listingDetail, isLoading: isDetailLoading } = useListingDetail(actualId || "");

  const play = useCallback(async () => {
    if (!listingDetail) {
      const errorMsg = "Unable to load audio. Please try again.";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return;
    }

    if (!listingDetail.primaryAudioAsset?.url) {
      const errorMsg = "No audio available for this lecture.";
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construct Track object from listing detail
      const track: Track = {
        id: listingDetail.id,
        title: listingDetail.title,
        artist: listingDetail.scholar.name,
        url: listingDetail.primaryAudioAsset.url,
        durationSeconds:
          listingDetail.durationSeconds || listingDetail.primaryAudioAsset.durationSeconds || 0,
        artworkUrl: listingDetail.scholar.imageUrl,
        seriesId: listingDetail.seriesContext?.seriesId,
        seriesTitle: listingDetail.seriesContext?.seriesTitle,
      };

      // Play the track using the audio service
      await audioService.playListing(track);
    } catch (err) {
      const sanitized = sanitizeError(err);
      setError(sanitized);
      options?.onError?.(sanitized);
      console.error("Failed to play listing:", err);
    } finally {
      setIsLoading(false);
    }
  }, [listingDetail, options]);

  return {
    play,
    isLoading: isLoading || isDetailLoading,
    error,
  };
}
