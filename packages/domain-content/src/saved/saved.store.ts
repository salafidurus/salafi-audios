import { createEntityStore, type SyncableEntity } from "@sd/core-sync";

/** Maintains optimistic saved Listing state and its tombstone-aware selectors. */
/**
 * `id` is the stable listingId (uuid) — this is what the rest of the app
 * keys "is this saved" lookups on. `slug` is carried alongside for the
 * sync layer's push, since the single-item save/unsave endpoint resolves by
 * slug, not uuid (see `MyLibraryRepository.resolveListingId`). Absent
 * `savedAt` means the entry is tombstoned (unsaved).
 */
export type SavedEntry = SyncableEntity & {
  savedAt?: string;
  /** Public Listing slug retained for endpoint resolution during sync. */
  slug?: string;
};

/** Shared local entity store for saved Listing relationships. */
export const useSavedStore = createEntityStore<SavedEntry>();

/** Returns whether a Listing has an active, non-tombstoned saved entry. */
export function isSaved(listingId: string): boolean {
  const entry = useSavedStore.getState().actions.get(listingId);
  return !!entry && !entry.deletedAt;
}

/** Reactive hook — re-renders when this listing's saved state changes. */
export function useIsSaved(listingId: string): boolean {
  return useSavedStore((state) => {
    const entry = state.entities[listingId];
    return !!entry && !entry.deletedAt;
  });
}

/** Ids of all currently-saved (non-tombstoned) listings. */
export function getSavedIds(): string[] {
  return useSavedStore
    .getState()
    .actions.getActive()
    .map((entry) => entry.id);
}

/** Optimistic local write — the sync layer (`saved.sync.ts`) schedules the actual push. */
export function markSavedLocally(listingId: string, slug?: string): void {
  const now = new Date().toISOString();
  const existing = useSavedStore.getState().actions.get(listingId);
  useSavedStore.getState().actions.upsert({
    id: listingId,
    updatedAt: now,
    savedAt: now,
    slug: slug ?? existing?.slug,
  });
}

/**
 * Optimistic local write. Tombstones rather than hard-removing — a hard remove
 * would drop LWW protection, letting a stale "still saved" hydrate/delta pull
 * silently revive an entry the user just unsaved.
 */
export function markUnsavedLocally(listingId: string, slug?: string): void {
  const now = new Date().toISOString();
  const existing = useSavedStore.getState().actions.get(listingId);
  useSavedStore.getState().actions.upsert({
    id: listingId,
    updatedAt: now,
    deletedAt: now,
    slug: slug ?? existing?.slug,
  });
}
