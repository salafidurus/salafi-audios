import { describe, it, expect } from "vitest";
import { lightNativeTheme } from "../theme/native";
import { lightWebTheme } from "../theme/web";

describe("border width tokens", () => {
  it("should match specifications", () => {
    expect(lightNativeTheme.border.width.default).toBe(1);
    expect(lightNativeTheme.border.width.hairline).toBe(-1);
    expect(lightWebTheme.border.width.default).toBe("1px");
    expect(lightWebTheme.border.width.hairline).toBe("1px");
  });
});
