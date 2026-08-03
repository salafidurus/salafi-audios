import { describe, expect, it } from "bun:test";

import {
  createAccentThemeCssBlock,
  createThemeCssBlock,
  getColorThemeProperties,
  getNonColorThemeProperties,
  getThemeProperties,
} from "./css";
import { accentWebThemes, darkWebTheme, lightWebTheme } from "./index";

const COLOR_PROPS = [
  "--surface-canvas",
  "--surface-default",
  "--content-strong",
  "--border-default",
  "--action-primary",
  "--accent-primary-bg",
  "--chrome-surface",
  "--input-border-rest",
  "--hover-accent-surface",
  "--screen-wash-mixed",
  "--state-success",
];

const NON_COLOR_MARKERS = [
  "--space-layout-page-x",
  "--radius-component-card",
  "--border-width-default",
  "--shadow-md",
  "--typo-body-md-font-size",
  "--chrome-shadow",
];

const ALL_THEMES = [lightWebTheme, darkWebTheme, ...Object.values(accentWebThemes)];

describe("theme css builders", () => {
  it("color block re-declares every color property", () => {
    for (const theme of ALL_THEMES) {
      const block = getColorThemeProperties(theme);
      for (const prop of COLOR_PROPS) {
        expect(block).toContain(`${prop}:`);
      }
    }
  });

  it("color block excludes layout, typography, radius, shadow, and width properties", () => {
    const block = getColorThemeProperties(accentWebThemes.manuscript);
    for (const marker of NON_COLOR_MARKERS) {
      expect(block).not.toContain(marker);
    }
  });

  it("non-color block includes layout, typography, radius, shadow, and width properties", () => {
    const block = getNonColorThemeProperties(lightWebTheme);
    for (const marker of NON_COLOR_MARKERS) {
      expect(block).toContain(`${marker}:`);
    }
  });

  it("full block is the concatenation of color and non-color blocks", () => {
    expect(getThemeProperties(darkWebTheme)).toBe(
      getColorThemeProperties(darkWebTheme) + getNonColorThemeProperties(darkWebTheme),
    );
  });

  it("never emits undefined or NaN values", () => {
    for (const theme of ALL_THEMES) {
      expect(getThemeProperties(theme)).not.toContain("undefined");
      expect(getThemeProperties(theme)).not.toContain("NaN");
    }
  });

  it("wraps full properties in the given selector", () => {
    expect(createThemeCssBlock(":root", lightWebTheme)).toBe(
      `:root {${getThemeProperties(lightWebTheme)}}`,
    );
  });

  it("accent block uses the accent selector and color-only properties", () => {
    const block = createAccentThemeCssBlock(
      '[data-accent-theme="manuscript"]',
      accentWebThemes.manuscript,
    );
    expect(block).toContain('[data-accent-theme="manuscript"] {');
    expect(block).toContain("--surface-canvas:");
    expect(block).not.toContain("--typo-body-md-font-size:");
  });

  it("each accent palette drives its own canvas and action tokens", () => {
    const manuscript = createAccentThemeCssBlock(
      '[data-accent-theme="manuscript"]',
      accentWebThemes.manuscript,
    );
    expect(manuscript).toContain("--surface-canvas: #0D1912;");
    expect(manuscript).toContain("--action-primary: #CBA135;");
  });
});
