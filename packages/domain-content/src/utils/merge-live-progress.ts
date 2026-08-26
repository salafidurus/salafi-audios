import type { MyLibraryItemDto } from "@sd/core-contracts";
import type { ListingProgress, Track } from "@sd/domain-audio";

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
  const merged = items.map((item) => {
    const live = progressMap[item.listingSlug];
    if (!live) return item;

    return {
      ...item,
      progressSeconds: live.positionSeconds,
      durationSeconds: item.durationSeconds ?? live.durationSeconds,
      completedAt: live.completedAt ?? item.completedAt,
    };
  });

  const isStandaloneTrack = currentTrack && !currentTrack.seriesId && !currentTrack.collectionId;
  const liveCurrent = currentTrack ? progressMap[currentTrack.slug] : undefined;
  const alreadyListed = currentTrack
    ? merged.some((item) => item.listingSlug === currentTrack.slug)
    : true;

  if (
    currentTrack &&
    isStandaloneTrack &&
    liveCurrent &&
    !liveCurrent.completedAt &&
    !alreadyListed
  ) {
    merged.unshift({
      id: currentTrack.slug,
      listingId: currentTrack.slug,
      listingTitle: currentTrack.title,
      listingSlug: currentTrack.slug ?? currentTrack.id,
      scholarId: "",
      scholarSlug: currentTrack.scholarSlug ?? "",
      scholarName: currentTrack.artist,
      durationSeconds: liveCurrent.durationSeconds || currentTrack.durationSeconds,
      progressSeconds: liveCurrent.positionSeconds,
    });
  }

  return merged;
}
