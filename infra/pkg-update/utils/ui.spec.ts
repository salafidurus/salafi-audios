import { describe, it, expect } from "bun:test";

import { formatVersionDiff } from "./ui";

describe("ui utils", () => {
  it("formats the complete version transition", () => {
    const rendered = ["\u001b[2m", "\u001b[22m", "\u001b[36m", "\u001b[39m", "\u001b[32m"].reduce(
      (value, sequence) => value.replaceAll(sequence, ""),
      formatVersionDiff("^1.0.0", "2.0.0"),
    );

    expect(rendered).toBe("^1.0.0 → 2.0.0");
  });
});
