import { describe, it, expect } from "bun:test";
import { splitScholarContent } from "./scholar.api";
import type { ScholarContentItemDto } from "@sd/core-contracts";

const makeItem = (id: string): ScholarContentItemDto => ({
  id,
  slug: id,
  title: `Title ${id}`,
  type: "single",
  recencyAt: "2024-01-01T00:00:00.000Z",
});

describe("splitScholarContent", () => {
  it("returns all undefined/empty for empty array", () => {
    const result = splitScholarContent([]);
    expect(result.featured).toBeUndefined();
    expect(result.recommended).toEqual([]);
    expect(result.browse).toEqual([]);
  });

  it("handles fewer items than recommendedCount", () => {
    const items = [makeItem("a"), makeItem("b"), makeItem("c")];
    const result = splitScholarContent(items, 4);
    expect(result.featured).toEqual(items[0]);
    expect(result.recommended).toEqual([items[1], items[2]]);
    expect(result.browse).toEqual([]);
  });

  it("splits correctly for normal case", () => {
    const items = Array.from({ length: 10 }, (_, i) => makeItem(String(i)));
    const result = splitScholarContent(items, 4);
    expect(result.featured).toEqual(items[0]);
    expect(result.recommended).toEqual(items.slice(1, 5));
    expect(result.browse).toEqual(items.slice(5));
  });

  it("uses default recommendedCount of 4", () => {
    const items = Array.from({ length: 8 }, (_, i) => makeItem(String(i)));
    const result = splitScholarContent(items);
    expect(result.recommended).toHaveLength(4);
    expect(result.browse).toHaveLength(3);
  });
});
