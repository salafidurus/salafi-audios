import { describe, it, expect } from "bun:test";

import { formatVersionDiff } from "./ui";

describe("ui utils", () => {
  it("formats the complete version transition", () => {
    expect(formatVersionDiff("^1.0.0", "2.0.0")).toBe("^1.0.0 → 2.0.0");
  });
});
