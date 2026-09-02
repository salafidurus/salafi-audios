import type { Track } from "../types/track.types";

/** Playback utility module for identity matching and progress projections. */
/** Listing identity used to determine whether a Track belongs to a listing view. */
export type ListingPlaybackRef = {
  id: string;
  /** Client-facing Listing slug used for single-track identity matching. */
  slug: string;
  format: "single" | "series" | "collection";
};

/** Checks whether a string is a supported Listing playback format. */
export function isListingFormat(value: string): value is ListingPlaybackRef["format"] {
  return value === "single" || value === "series" || value === "collection";
}

/** Checks whether the active Track belongs to the requested Listing. */
export function isTrackActiveForListing(
  listing: ListingPlaybackRef,
  currentTrack: Pick<Track, "slug" | "seriesId" | "collectionId"> | null | undefined,
): boolean {
  if (!currentTrack) return false;
  if (listing.format === "single") return currentTrack.slug === listing.slug;
  if (listing.format === "series") return currentTrack.seriesId === listing.id;
  return currentTrack.collectionId === listing.id;
}

/** Converts playback position to a clamped percentage, handling unknown duration. */
export function getProgressPercent(positionSeconds: number, durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  if (!Number.isFinite(positionSeconds)) return 0;
  return Math.min(Math.max((positionSeconds / durationSeconds) * 100, 0), 100);
}
