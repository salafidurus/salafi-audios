import { createColors, type AppColors } from "@sd/design-tokens";

/**
 * Named accent themes — web-only palette variants layered on top of the shared
 * design-token color system. They re-declare the existing CSS color/chrome/accent
 * variables under a `data-accent-theme` attribute, so no component CSS changes are
 * required to restyle the app. `@sd/design-tokens` itself is never modified here.
 */

export type AccentThemeId = "parchment" | "manuscript" | "midnight" | "ember";

export const ACCENT_THEME_IDS: readonly AccentThemeId[] = [
  "parchment",
  "manuscript",
  "midnight",
  "ember",
];

export interface AccentPalette {
  label: string;
  description: string;
  /** Base color mode the palette is designed against (drives shadows + state colors). */
  mode: "light" | "dark";
  /** [canvas, accent, secondary] — used by the settings picker preview. */
  swatches: [string, string, string];
  canvas: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderSoft: string;
  gold: string;
  goldBright: string;
  onGold: string;
  jade: string;
  jadeDim: string;
  text: string;
  textSoft: string;
  textFaint: string;
}

export const ACCENT_PALETTES: Record<AccentThemeId, AccentPalette> = {
  parchment: {
    label: "Parchment",
    description: "Ivory & antique gold",
    mode: "light",
    swatches: ["#F7F2E7", "#B8872E", "#2F6B54"],
    canvas: "#F7F2E7",
    surface: "#FFFFFF",
    surfaceRaised: "#F1EAD9",
    border: "#E3D9C2",
    borderSoft: "#ECE3CE",
    gold: "#B8872E",
    goldBright: "#8A5A12",
    onGold: "#2B1B06",
    jade: "#2F6B54",
    jadeDim: "#BFDCCB",
    text: "#241C10",
    textSoft: "#6B5F49",
    textFaint: "#9C8B68",
  },
  manuscript: {
    label: "Manuscript",
    description: "Ink-green & gold leaf",
    mode: "dark",
    swatches: ["#0D1912", "#CBA135", "#4F9C82"],
    canvas: "#0D1912",
    surface: "#152420",
    surfaceRaised: "#1B2E27",
    border: "#2A3D33",
    borderSoft: "#233329",
    gold: "#CBA135",
    goldBright: "#E4C767",
    onGold: "#20180A",
    jade: "#4F9C82",
    jadeDim: "#3A6F5C",
    text: "#F2EEE3",
    textSoft: "#A9BDAF",
    textFaint: "#6E8378",
  },
  midnight: {
    label: "Midnight",
    description: "Indigo dusk & amber",
    mode: "dark",
    swatches: ["#0B0F1C", "#E0A458", "#6C7BC4"],
    canvas: "#0B0F1C",
    surface: "#131A2C",
    surfaceRaised: "#1A2338",
    border: "#2B3654",
    borderSoft: "#212B45",
    gold: "#E0A458",
    goldBright: "#F0C285",
    onGold: "#20140A",
    jade: "#6C7BC4",
    jadeDim: "#4A5590",
    text: "#EDEEF5",
    textSoft: "#A6ADC6",
    textFaint: "#6C7391",
  },
  ember: {
    label: "Ember",
    description: "Warm charcoal & rust",
    mode: "dark",
    swatches: ["#15130F", "#C1633D", "#B08D57"],
    canvas: "#15130F",
    surface: "#1E1B15",
    surfaceRaised: "#26221A",
    border: "#3A3327",
    borderSoft: "#2E291F",
    gold: "#C1633D",
    goldBright: "#D98761",
    onGold: "#1A0D07",
    jade: "#B08D57",
    jadeDim: "#7A6440",
    text: "#F1ECE3",
    textSoft: "#B3A99B",
    textFaint: "#7A7166",
  },
};

const parseHex = (hex: string): [number, number, number] => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = parseInt(value, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

const mixHex = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(ar + (br - ar) * t)}${toHex(ag + (bg - ag) * t)}${toHex(ab + (bb - ab) * t)}`;
};

/**
 * Builds a complete AppColors for an accent theme. Each palette declares the base
 * color mode it is designed against (`parchment` is light-mood; the others are
 * dark-mood), so shadows and success/danger state colors are carried over from the
 * matching base palette. The light/dark selector only affects the `default` theme.
 */
export const buildAccentColors = (id: AccentThemeId): AppColors => {
  const base = createColors(ACCENT_PALETTES[id].mode);
  const p = ACCENT_PALETTES[id];

  return {
    surface: {
      canvas: p.canvas,
      default: p.surface,
      subtle: p.surfaceRaised,
      elevated: p.surfaceRaised,
      hover: mixHex(p.surface, p.surfaceRaised, 0.55),
      inverse: p.text,
      primarySubtle: mixHex(p.jade, p.surface, 0.16),
      secondarySubtle: mixHex(p.gold, p.surface, 0.16),
      selected: mixHex(p.jade, p.surface, 0.3),
      disabled: p.surfaceRaised,
    },
    content: {
      strong: p.text,
      default: p.text,
      subtle: p.textSoft,
      muted: p.textFaint,
      inverse: p.canvas,
      primary: p.goldBright,
      primaryStrong: p.goldBright,
      secondary: p.jade,
      secondaryStrong: p.jade,
      onPrimary: p.onGold,
      onSecondary: p.canvas,
      onDanger: p.canvas,
      onSuccess: p.onGold,
      disabled: p.textFaint,
    },
    border: {
      default: p.border,
      subtle: p.borderSoft,
      strong: p.border,
      muted: p.borderSoft,
      hover: mixHex(p.gold, p.border, 0.45),
      focus: p.gold,
      primary: p.jade,
      primaryStrong: p.jadeDim,
      secondary: p.gold,
      secondaryStrong: p.goldBright,
      disabled: p.borderSoft,
    },
    action: {
      primary: p.gold,
      primaryHover: p.goldBright,
      primaryActive: mixHex(p.gold, p.canvas, 0.22),
      secondary: p.jade,
      secondaryHover: mixHex(p.jade, p.text, 0.2),
      secondaryActive: p.jadeDim,
      danger: base.action.danger,
      dangerHover: base.action.dangerHover,
      dangerActive: base.action.dangerActive,
      success: base.action.success,
      successHover: base.action.successHover,
      successActive: base.action.successActive,
      disabled: p.surfaceRaised,
      disabledContent: p.textFaint,
    },
    state: base.state,
  } as AppColors;
};
