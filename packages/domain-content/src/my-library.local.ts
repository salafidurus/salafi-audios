import type { MyLibraryItemDto } from "@sd/core-contracts";
import type { ListingProgress } from "@sd/domain-audio";

import type { SavedEntry } from "./saved/saved.store";

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

export function localSavedItems(entries: SavedEntry[]): MyLibraryItemDto[] {
  return entries
    .filter((entry): entry is SavedEntry & { savedAt: string } => !!entry.savedAt)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .map((entry) => ({
      id: entry.id,
      listingId: entry.id,
      listingTitle: entry.id,
      listingSlug: entry.id,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      savedAt: entry.savedAt,
    }));
}

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
