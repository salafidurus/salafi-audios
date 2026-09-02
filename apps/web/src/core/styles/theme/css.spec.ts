import { describe, expect, it } from "bun:test";

import {
  createThemeCssBlock,
  getColorThemeProperties,
  getNonColorThemeProperties,
  getThemeProperties,
} from "./css";
import { darkWebTheme, lightWebTheme } from "./index";

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
  "--badge-success-surface",
  "--badge-success-border",
  "--badge-success-fg",
  "--badge-warning-surface",
  "--badge-warning-border",
  "--badge-warning-fg",
  "--badge-danger-surface",
  "--badge-danger-border",
  "--badge-danger-fg",
];

const NON_COLOR_MARKERS = [
  "--space-layout-page-x",
  "--radius-component-card",
  "--border-width-default",
  "--shadow-md",
  "--typo-body-md-font-size",
  "--chrome-shadow",
];

const ALL_THEMES = [lightWebTheme, darkWebTheme];

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
    const block = getColorThemeProperties(darkWebTheme);
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
});
