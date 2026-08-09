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

  it("light and dark base themes meet WCAG 2.1 AA text contrast standards (>= 4.5:1)", () => {
    const parseHex = (hex: string): [number, number, number] => {
      let h = hex.replace("#", "").trim();
      if (h.length === 3) {
        h = h.split("").map((c) => c + c).join("");
      }
      const int = parseInt(h, 16);
      return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    };

    const relativeLuminance = (hex: string): number => {
      const [r255, g255, b255] = parseHex(hex);
      const transform = (c: number) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * transform(r255) + 0.7152 * transform(g255) + 0.0722 * transform(b255);
    };

    const contrastRatio = (hex1: string, hex2: string): number => {
      const l1 = relativeLuminance(hex1);
      const l2 = relativeLuminance(hex2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    for (const mode of ["light", "dark"] as const) {
      const c = createColors(mode);
      const surfaces = [c.surface.canvas, c.surface.default, c.surface.subtle, c.surface.elevated];
      const textTokens = [
        c.content.strong,
        c.content.default,
        c.content.subtle,
        c.content.muted,
      ];

      for (const surface of surfaces) {
        for (const text of textTokens) {
          const cr = contrastRatio(text, surface);
          expect(cr).toBeGreaterThanOrEqual(4.5);
        }
      }

      // Check onDanger button text contrast
      expect(contrastRatio(c.content.onDanger, c.action.danger)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

