"use client";

import { useCallback, useState } from "react";
import { useListingDetail } from "@sd/domain-content";
import type { Track } from "@sd/domain-audio";
import { useToast } from "@/core/toast";
import { audioService } from "../index";

/**
 * Hook to play a listing by ID.
 * Fetches the full listing detail and initiates playback via the audio service.
 * Shows error toasts for user feedback.
 *
 * @param listingId - The ID of the listing to play (in format "prefix:id")
 * @returns Object with play function, loading state, and error state
 */
export function usePlayListing(listingId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Extract actual ID if it's in "prefix:id" format
  const actualId = listingId ? listingId.split(":")[1] || listingId : null;

  // Fetch the full listing detail to get the stream URL
  const { data: listingDetail, isLoading: isDetailLoading } = useListingDetail(actualId || "");

  const play = useCallback(async () => {
    if (!listingDetail) {
      const errorMsg = "Listing detail not loaded";
      setError(errorMsg);
      addToast(errorMsg, "error");
      return;
    }

    if (!listingDetail.primaryAudioAsset?.url) {
      const errorMsg = "No audio available for this listing";
      setError(errorMsg);
      addToast(errorMsg, "error");
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
      const message = err instanceof Error ? err.message : "Failed to play audio";
      setError(message);
      addToast(message, "error");
      console.error("Failed to play listing:", err);
    } finally {
      setIsLoading(false);
    }
  }, [listingDetail, addToast]);

  return {
    play,
    isLoading: isLoading || isDetailLoading,
    error,
  };
}
