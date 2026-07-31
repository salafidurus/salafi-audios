import type { AdminListingListItemDto } from "@sd/core-contracts";

import { filterListings } from "./filter-listings";

const items = [
  { id: "1", title: "Tafsir Al-Baqarah", scholarName: "Sheikh Ahmad", status: "draft" },
  { id: "2", title: "Fiqh of Salah", scholarName: "Sheikh Ibrahim", status: "published" },
] as AdminListingListItemDto[];

describe("filterListings", () => {
  it("returns all items when the query is empty", () => {
    expect(filterListings(items, "")).toEqual(items);
  });

  it("matches items by title, case-insensitively", () => {
    expect(filterListings(items, "tafsir")).toEqual([items[0]]);
  });

  it("matches items by scholar name, case-insensitively", () => {
    expect(filterListings(items, "ibrahim")).toEqual([items[1]]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterListings(items, "nonexistent")).toEqual([]);
  });
});
