import type { Track } from "../types/track.types";

export type ListingPlaybackRef = {
  id: string;
  slug: string;
  format: "single" | "series" | "collection";
};

export function isListingFormat(value: string): value is ListingPlaybackRef["format"] {
  return value === "single" || value === "series" || value === "collection";
}

export function isTrackActiveForListing(
  listing: ListingPlaybackRef,
  currentTrack: Pick<Track, "slug" | "seriesId" | "collectionId"> | null | undefined,
): boolean {
  if (!currentTrack) return false;
  if (listing.format === "single") return currentTrack.slug === listing.slug;
  if (listing.format === "series") return currentTrack.seriesId === listing.id;
  return currentTrack.collectionId === listing.id;
}

export function getProgressPercent(positionSeconds: number, durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  if (!Number.isFinite(positionSeconds)) return 0;
  return Math.min(Math.max((positionSeconds / durationSeconds) * 100, 0), 100);
}
