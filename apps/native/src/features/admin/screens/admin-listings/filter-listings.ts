import type { AdminListingListItemDto } from "@sd/core-contracts";

export function filterListings(
  items: AdminListingListItemDto[],
  query: string,
): AdminListingListItemDto[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(trimmed) ||
      item.scholarName.toLowerCase().includes(trimmed),
  );
}
