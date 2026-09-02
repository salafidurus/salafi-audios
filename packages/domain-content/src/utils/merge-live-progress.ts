import type { MyLibraryItemDto } from "@sd/core-contracts";
import type { ListingProgress, Track } from "@sd/domain-audio";

/** Overlays live playback progress onto server-backed My Library rows. */
/**
 * Overlays live, per-tick playback progress onto the server-fetched "In
 * Progress" list so a position update shows up immediately instead of
 * waiting for the batched sync + a query refetch. Only overrides fields the
 * live store actually tracks — everything else (title, slug, scholar) still
 * comes from the server row.
 *
 * If the currently-playing track is a standalone lecture not yet present in
 * the list (just started, not yet synced), it's added at the top. A lesson
 * nested in a Series/Collection is intentionally left out of this synthetic
 * step — the API rolls those up to the top-level listing (see
 * MyLibraryRepository.findInProgress), and this function has no way to know
 * that top-level listing's own title/slug from Track metadata alone. That
 * case self-heals within the next sync + invalidation instead.
 */
export function mergeLiveProgress(
  items: MyLibraryItemDto[],
  progressMap: Record<string, ListingProgress>,
  currentTrack?: Track | null,
): MyLibraryItemDto[] {
  const merged = items.map((item) => mergeItemProgress(item, progressMap[item.listingSlug]));

  const isStandaloneTrack = Boolean(
    currentTrack && !currentTrack.seriesId && !currentTrack.collectionId,
  );
  const liveCurrent = currentTrack ? progressMap[currentTrack.slug] : undefined;
  const alreadyListed = currentTrack
    ? merged.some((item) => item.listingSlug === currentTrack.slug)
    : true;

  addCurrentTrackIfNeeded(merged, currentTrack, isStandaloneTrack, liveCurrent, alreadyListed);

  return merged;
}

function addCurrentTrackIfNeeded(
  items: MyLibraryItemDto[],
  track: Track | null | undefined,
  isStandalone: boolean,
  live: ListingProgress | undefined,
  alreadyListed: boolean,
): void {
  if (!shouldAddCurrentTrack(track, isStandalone, live, alreadyListed) || !track || !live) return;
  items.unshift(createCurrentTrackItem(track, live));
}

function mergeItemProgress(item: MyLibraryItemDto, live?: ListingProgress): MyLibraryItemDto {
  if (!live) return item;
  return {
    ...item,
    progressSeconds: live.positionSeconds,
    durationSeconds: item.durationSeconds ?? live.durationSeconds,
    completedAt: live.completedAt ?? item.completedAt,
  };
}

function shouldAddCurrentTrack(
  track: Track | null | undefined,
  isStandalone: boolean,
  live: ListingProgress | undefined,
  alreadyListed: boolean,
): boolean {
  return Boolean(track && isStandalone && live && !live.completedAt && !alreadyListed);
}

function createCurrentTrackItem(track: Track, live: ListingProgress): MyLibraryItemDto {
  return {
    id: track.slug,
    listingId: track.slug,
    listingTitle: track.title,
    listingSlug: track.slug ?? track.id,
    scholarId: "",
    scholarSlug: track.scholarSlug ?? "",
    scholarName: track.artist,
    durationSeconds: live.durationSeconds || track.durationSeconds,
    progressSeconds: live.positionSeconds,
  };
}
