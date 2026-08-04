import { describe, it, expect } from "bun:test";

import { formatVersionDiff } from "./ui";

describe("ui utils", () => {
  it("formatVersionDiff includes arrow", () => {
    const result = formatVersionDiff("^1.0.0", "2.0.0");
    expect(result).toContain("→");
  });
});
