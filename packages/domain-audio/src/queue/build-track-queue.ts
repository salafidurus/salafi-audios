import type { ListingContentItemDto, ListingContentsDto, ListingFormat } from "@sd/core-contracts";

import type { Track } from "../types/track.types";

export type QueueListingRef = {
  id: string;
  title: string;
  format: ListingFormat;
  scholarName: string;
  scholarSlug?: string;
  artworkUrl?: string;
};

export type BuildTrackQueueOptions = {
  /** The lesson/single id playback should start at. Defaults to the first track. */
  startAtId?: string;
};

/**
 * Flattens an already-ordered `ListingContentsDto` into the flat play queue for a
 * Single/Series/Collection. For a Collection this crosses Module boundaries in
 * order (all of Module 1's lessons, then all of Module 2's, ...).
 *
 * Only the starting track gets an eagerly-resolved stream URL; every other track
 * is left as an empty-string lazy stub, matching `DurusAudioService.resolveStreamUrl()`'s
 * existing lazy-resolution convention so signed URLs aren't fetched for tracks that
 * may not be played for a long time (or ever).
 */
export function buildTrackQueue(
  listing: QueueListingRef,
  contents: ListingContentsDto,
  options: BuildTrackQueueOptions = {},
): Track[] {
  const leaves: { item: ListingContentItemDto; extra: Partial<Track> }[] =
    contents.format === "collection"
      ? contents.modules.flatMap((listingModule) =>
          listingModule.lessons.map((lesson) => ({
            item: lesson,
            extra: {
              collectionId: listing.id,
              moduleId: listingModule.id,
              moduleTitle: listingModule.title,
            },
          })),
        )
      : contents.items.map((item) => ({
          item,
          extra:
            contents.format === "series"
              ? { seriesId: listing.id, seriesTitle: listing.title }
              : {},
        }));

  const startAtId = options.startAtId ?? leaves[0]?.item.id;

  return leaves.map(({ item, extra }) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    artist: listing.scholarName,
    scholarSlug: listing.scholarSlug,
    url: item.id === startAtId ? (item.primaryAudioAsset?.url ?? "") : "",
    durationSeconds: item.durationSeconds ?? item.primaryAudioAsset?.durationSeconds ?? 0,
    artworkUrl: listing.artworkUrl,
    orderIndex: item.orderIndex,
    ...extra,
  }));
}
