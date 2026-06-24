import { describe, it, expect } from "vitest";
import { lightWebTheme } from "../theme/web";

describe("border width tokens", () => {
  it("web border width should match specifications", () => {
    expect(lightWebTheme.border.width.default).toBe("1px");
    expect(lightWebTheme.border.width.hairline).toBe("1px");
  });
});
