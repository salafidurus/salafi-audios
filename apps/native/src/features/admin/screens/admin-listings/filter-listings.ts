import type { AdminListingListItemDto } from "@sd/core-contracts";

/** Provides authenticated native administration workflows and their data boundaries. */
/** Transforms listings into the shape expected by native consumers. */
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
