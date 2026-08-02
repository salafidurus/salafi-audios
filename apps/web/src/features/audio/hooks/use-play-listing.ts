"use client";

import type { ListingContentsDto, ListingFormat } from "@sd/core-contracts";

import { endpoints, httpClient } from "@sd/core-contracts";
import { buildTrackQueue } from "@sd/domain-audio";
import { sanitizeError } from "@sd/utils-error";
import { useCallback, useState } from "react";

import { audioService } from "../audio-service";

export type PlayListingRef = {
  id: string;
  slug: string;
  title: string;
  format: ListingFormat;
  scholarName: string;
  scholarSlug?: string;
  artworkUrl?: string;
};

export type UsePlayListingOptions = {
  /**
   * Optional callback to handle errors. If provided, errors will be passed here
   * instead of being stored in the error state.
   */
  onError?: (message: string) => void;
};

/**
 * Hook to play a listing by ref (id/slug/format).
 *
 * Fetches the listing's contents (its own audio for a single, or its ordered
 * lessons/modules for a series/collection) and starts playback with the full
 * queue — so series/collection results resume auto-advance, matching how the
 * listing detail page's own Play button behaves, instead of trying to stream
 * a container listing directly (which has no audio of its own).
 */
export function usePlayListing(ref: PlayListingRef | null, options?: UsePlayListingOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const play = useCallback(async () => {
    if (!ref) return;

    setIsLoading(true);
    setError(null);

    try {
      const contents = await httpClient<ListingContentsDto>({
        url: endpoints.listings.contents(ref.slug),
        method: "GET",
      });

      const queue = buildTrackQueue(
        {
          id: ref.id,
          title: ref.title,
          format: ref.format,
          scholarName: ref.scholarName,
          scholarSlug: ref.scholarSlug,
          artworkUrl: ref.artworkUrl,
        },
        contents,
      );

      const [firstTrack] = queue;
      if (!firstTrack) {
        const errorMsg = "No audio available for this lecture.";
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return;
      }

      await audioService.playListing(firstTrack, queue);
    } catch (err) {
      const sanitized = sanitizeError(err);
      setError(sanitized);
      options?.onError?.(sanitized);
      console.error("Failed to play listing:", err);
    } finally {
      setIsLoading(false);
    }
  }, [ref, options]);

  return {
    play,
    isLoading,
    error,
  };
}
