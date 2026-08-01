import type { ScholarListItemDto } from "@sd/core-contracts";

export function filterScholars(items: ScholarListItemDto[], query: string): ScholarListItemDto[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(trimmed) || item.slug.toLowerCase().includes(trimmed),
  );
}
