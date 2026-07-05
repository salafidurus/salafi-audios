import type { LibraryItemDto } from "@sd/core-contracts";
import type { ListingProgress } from "@sd/domain-audio";

type SavedMap = Record<string, string>;

export function localProgressItems(progressMap: Record<string, ListingProgress>): LibraryItemDto[] {
  return Object.values(progressMap)
    .filter((p) => !p.completedAt && p.positionSeconds > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((p) => ({
      id: p.listingId,
      listingId: p.listingId,
      listingTitle: p.listingId,
      listingSlug: p.listingId,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      durationSeconds: p.durationSeconds,
      progressSeconds: p.positionSeconds,
    }));
}

export function localSavedItems(savedMap: SavedMap): LibraryItemDto[] {
  return Object.entries(savedMap)
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .map(([listingId, savedAt]) => ({
      id: listingId,
      listingId,
      listingTitle: listingId,
      listingSlug: listingId,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      savedAt,
    }));
}

export function localCompletedItems(
  progressMap: Record<string, ListingProgress>,
): LibraryItemDto[] {
  return Object.values(progressMap)
    .filter((p): p is ListingProgress & { completedAt: string } => !!p.completedAt)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .map((p) => ({
      id: p.listingId,
      listingId: p.listingId,
      listingTitle: p.listingId,
      listingSlug: p.listingId,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      durationSeconds: p.durationSeconds,
      progressSeconds: p.positionSeconds,
      completedAt: p.completedAt,
    }));
}
