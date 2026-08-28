import type { AdminListingListItemDto } from "@sd/core-contracts";

/** Provides the native features admin screens admin-listings filter-listings module responsibility. */
/** Describes the filterListings native function contract and behavior. */
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
