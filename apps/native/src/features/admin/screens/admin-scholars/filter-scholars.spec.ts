import type { ScholarListItemDto } from "@sd/core-contracts";

import { filterScholars } from "./filter-scholars";

const items = [
  { id: "1", name: "Sheikh Ahmad", slug: "sheikh-ahmad" },
  { id: "2", name: "Sheikh Ibrahim", slug: "sheikh-ibrahim" },
] as ScholarListItemDto[];

describe("filterScholars", () => {
  it("returns all items when the query is empty", () => {
    expect(filterScholars(items, "")).toEqual(items);
  });

  it("matches items by name, case-insensitively", () => {
    expect(filterScholars(items, "ahmad")).toEqual([items[0]]);
  });

  it("matches items by slug, case-insensitively", () => {
    expect(filterScholars(items, "IBRAHIM")).toEqual([items[1]]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterScholars(items, "nonexistent")).toEqual([]);
  });
});
