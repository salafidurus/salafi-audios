import type { ScholarListItemDto } from "@sd/core-contracts";

/** Provides authenticated native administration workflows and their data boundaries. */
/** Transforms scholars into the shape expected by native consumers. */
export function filterScholars(items: ScholarListItemDto[], query: string): ScholarListItemDto[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(trimmed) || item.slug.toLowerCase().includes(trimmed),
  );
}
