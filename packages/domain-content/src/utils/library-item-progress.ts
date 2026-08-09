import type { LibraryItemDto } from "@sd/core-contracts";

/**
 * Percent complete for a library row. Prefers the lesson-count rollup
 * (`completedLeafCount`/`totalLeafCount`, populated for series/collection
 * entries) over the raw position/duration ratio, since a top-level entry's
 * own `durationSeconds` doesn't represent a series' total listening time.
 */
export function getLibraryItemPercent(item: LibraryItemDto): number | null {
  if (item.totalLeafCount && item.totalLeafCount > 0) {
    return Math.round(((item.completedLeafCount ?? 0) / item.totalLeafCount) * 100);
  }

  if (item.durationSeconds && item.progressSeconds) {
    return Math.round((item.progressSeconds / item.durationSeconds) * 100);
  }

  return null;
}
