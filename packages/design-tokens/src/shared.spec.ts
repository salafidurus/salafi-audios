import { describe, it, expect } from "bun:test";
import { createColors } from "./colors/shared";
import { typographyBase } from "./typography/shared";

describe("shared design tokens", () => {
  it("createColors produces surface, content, border, action, and state tokens", () => {
    const light = createColors("light");
    expect(light.surface.canvas).toBeDefined();
    expect(light.content.default).toBeDefined();
    expect(light.border.default).toBeDefined();
    expect(light.action.primary).toBeDefined();
    expect(light.state.success).toBeDefined();
  });

  it("createColors produces distinct light and dark palettes", () => {
    const light = createColors("light");
    const dark = createColors("dark");
    expect(light.surface.canvas).not.toBe(dark.surface.canvas);
  });

  it("typographyBase contains all expected variants", () => {
    const variants = [
      "displayLg",
      "displayMd",
      "titleLg",
      "titleMd",
      "bodyLg",
      "bodyMd",
      "bodySm",
      "labelMd",
      "caption",
      "xs",
    ];
    for (const variant of variants) {
      expect(typographyBase).toHaveProperty(variant);
    }
  });
});
