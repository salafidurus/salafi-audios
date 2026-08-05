import { describe, expect, it } from "bun:test";

import { ACCENT_THEME_IDS, buildAccentColors } from "./variants";

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const int = parseInt(h, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function relativeLuminance(hex: string): number {
  const [r255, g255, b255] = parseHex(hex);
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r255) + 0.7152 * transform(g255) + 0.0722 * transform(b255);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe("Accent Themes Contrast Ratios (WCAG 2.1 AA)", () => {
  for (const id of ACCENT_THEME_IDS) {
    it(`theme '${id}' text tokens pass >= 4.5:1 contrast against surface layers`, () => {
      const c = buildAccentColors(id);
      const surfaces = [c.surface.canvas, c.surface.default, c.surface.subtle, c.surface.elevated];
      const textTokens = [
        { name: "content.strong", val: c.content.strong },
        { name: "content.default", val: c.content.default },
        { name: "content.subtle", val: c.content.subtle },
        { name: "content.muted", val: c.content.muted },
      ];

      for (const surface of surfaces) {
        for (const token of textTokens) {
          const cr = contrastRatio(token.val, surface);
          expect(cr).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    it(`theme '${id}' danger action button text achieves >= 4.5:1 contrast`, () => {
      const c = buildAccentColors(id);
      const cr = contrastRatio(c.content.onDanger, c.action.danger);
      expect(cr).toBeGreaterThanOrEqual(4.5);
    });

    it(`theme '${id}' focus ring achieves >= 3.0:1 UI contrast against default surface`, () => {
      const c = buildAccentColors(id);
      const cr = contrastRatio(c.border.focus, c.surface.default);
      expect(cr).toBeGreaterThanOrEqual(3.0);
    });
  }
});
