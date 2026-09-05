import type { FeedPageDto } from "@sd/core-contracts";

/**
 * Merges pages from one infinite query so each semantic batch renders once.
 * The first page owns batch metadata and item order; later pages contribute only
 * item identities not already rendered.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The preceding TSDoc describes the merge invariant.
export function mergeExplorePages(pages: FeedPageDto[]): FeedPageDto["batches"] {
  const batches = new Map<string, FeedPageDto["batches"][number]>();

  for (const page of pages) {
    for (const batch of page.batches) {
      const key = `${batch.kind}:${batch.id}`;
      const existing = batches.get(key);
      if (!existing) {
        batches.set(key, cloneBatch(batch));
        continue;
      }

      const seen = new Set(existing.items.map((item) => item.id));
      // SAFETY: every public feed item has an id, regardless of its batch kind.
      const existingItems = existing.items as Array<{ id: string }>;
      // SAFETY: every public feed item has an id, regardless of its batch kind.
      const incomingItems = batch.items as Array<{ id: string }>;
      existingItems.push(...incomingItems.filter((item) => !seen.has(item.id)));
    }
  }

  return [...batches.values()];
}

function cloneBatch(batch: FeedPageDto["batches"][number]): FeedPageDto["batches"][number] {
  if (batch.kind === "listings") return { ...batch, items: [...batch.items] };
  if (batch.kind === "scholars") return { ...batch, items: [...batch.items] };
  return { ...batch, items: [...batch.items] };
}
