import type { ScholarListItemDto } from "@sd/core-contracts";

/** Provides the native features admin screens admin-scholars filter-scholars module responsibility. */
/** Describes the filterScholars native function contract and behavior. */
export function filterScholars(items: ScholarListItemDto[], query: string): ScholarListItemDto[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(trimmed) || item.slug.toLowerCase().includes(trimmed),
  );
}
