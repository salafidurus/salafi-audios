import { describe, it, expect } from "bun:test";

import { contentItemAnchorId } from "./content-item-anchor-id";

describe("contentItemAnchorId", () => {
  it("prefixes the item id for use as a DOM anchor id", () => {
    expect(contentItemAnchorId("lesson-1")).toBe("content-item-lesson-1");
  });
});
