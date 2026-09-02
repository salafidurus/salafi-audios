/** Projects local progress and saved state into My Library display rows. */
import type { MyLibraryItemDto } from "@sd/core-contracts";
import type { ListingProgress } from "@sd/domain-audio";

import type { SavedEntry } from "./saved/saved.store";

/** Projects local personal state into the common My Library row contract. */
/** Converts unfinished local progress into locally available Library rows. */
export function localProgressItems(
  progressMap: Record<string, ListingProgress>,
): MyLibraryItemDto[] {
  return Object.values(progressMap)
    .filter((p) => !p.completedAt && p.positionSeconds > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((p) => ({
      id: p.listingSlug,
      listingId: p.listingSlug,
      listingTitle: p.listingSlug,
      listingSlug: p.listingSlug,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      durationSeconds: p.durationSeconds,
      progressSeconds: p.positionSeconds,
    }));
}

/** Converts active local saved entries into Library rows ordered by save time. */
export function localSavedItems(entries: SavedEntry[]): MyLibraryItemDto[] {
  return entries
    .filter((entry): entry is SavedEntry & { savedAt: string } => !!entry.savedAt)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .map((entry) => ({
      id: entry.id,
      listingId: entry.id,
      listingTitle: entry.slug ?? entry.id,
      listingSlug: entry.slug ?? entry.id,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      savedAt: entry.savedAt,
    }));
}

/** Converts completed local progress into Library rows ordered by completion time. */
export function localCompletedItems(
  progressMap: Record<string, ListingProgress>,
): MyLibraryItemDto[] {
  return Object.values(progressMap)
    .filter((p): p is ListingProgress & { completedAt: string } => !!p.completedAt)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .map((p) => ({
      id: p.listingSlug,
      listingId: p.listingSlug,
      listingTitle: p.listingSlug,
      listingSlug: p.listingSlug,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      durationSeconds: p.durationSeconds,
      progressSeconds: p.positionSeconds,
      completedAt: p.completedAt,
    }));
}
