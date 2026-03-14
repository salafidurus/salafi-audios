/**
 * Design Tokens — shadows.ts
 *
 * Changes from previous version:
 *
 * LIGHT MODE — stronger shadow opacity across the board.
 *   Previous values (0.06–0.22) were too subtle on near-white surfaces.
 *   Now that the canvas is off-white (#F2F2F3) and cards are pure white,
 *   shadows play a supporting role — they add softness and reinforce lift,
 *   but the canvas contrast does the primary separation work.
 *   Opacity bumped ~30% across all steps.
 *
 * LIGHT MODE — added `elevated` variant.
 *   surface.elevated shares the same #FFFFFF as surface.default. The only
 *   thing distinguishing a modal from a card is shadow depth. `elevated`
 *   has a significantly stronger shadow than `lg` to make sheets/modals
 *   feel clearly above the card layer.
 *
 * DARK MODE — substantially stronger shadow opacity.
 *   Previous values (0.18–0.28 mobile, 0.28–0.52 web) were near-invisible
 *   on dark surfaces. New values are as strong as practically useful, but
 *   note the border-first strategy: shadows alone cannot reliably separate
 *   surfaces in dark mode. Always combine shadow with border.default on
 *   dark-mode cards (surface.default components).
 *
 * MOBILE SHADOW STRATEGY
 *   - Light: use xs/sm on cards, md on bottom sheets, lg/elevated on modals.
 *   - Dark:  rely on border.default for card separation; use sm/md only for
 *     floating elements (FABs, tooltips, sheets) where shadow + border combo
 *     is visible enough. lg/elevated for full-screen modals.
 */

export const shadowsShared = {
  focus: {
    light: "0 0 0 3px rgb(20 184 166 / 0.28)",
    dark: "0 0 0 3px rgb(45 212 191 / 0.36)",
  },
} as const;

export const shadowsWeb = {
  xs: {
    light: "0 1px 3px rgb(15 23 42 / 0.10)", // was 0.06
    dark: "0 1px 3px rgb(0 0 0 / 0.40)", // was 0.28
  },
  sm: {
    light: "0 4px 12px -4px rgb(15 23 42 / 0.16)", // was 0.10
    dark: "0 4px 12px -4px rgb(0 0 0 / 0.52)", // was 0.34
  },
  md: {
    light: "0 10px 28px -10px rgb(15 23 42 / 0.22)", // was 0.16
    dark: "0 12px 32px -12px rgb(0 0 0 / 0.60)", // was 0.42
  },
  lg: {
    light: "0 20px 44px -16px rgb(15 23 42 / 0.28)", // was 0.22
    dark: "0 24px 56px -18px rgb(0 0 0 / 0.70)", // was 0.52
  },
  elevated: {
    // For surface.elevated (modals, sheets) in light mode:
    // same surface color as default (#FFF), differentiated by shadow alone.
    light: "0 32px 64px -20px rgb(15 23 42 / 0.36), 0 0 0 0.5px rgb(15 23 42 / 0.06)",
    dark: "0 32px 64px -20px rgb(0 0 0 / 0.80), 0 0 0 0.5px rgb(255 255 255 / 0.06)",
  },
  top: {
    light: "0 -20px 42px -30px rgb(15 23 42 / 0.22)", // was 0.18
    dark: "0 -24px 52px -36px rgb(0 0 0 / 0.68)", // was 0.56
  },
} as const;

export const shadowsMobile = {
  xs: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12, // was 0.08 — subtle card lift
      shadowRadius: 3,
      elevation: 2,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.36, // was 0.18 — dark surfaces need more
      shadowRadius: 3,
      elevation: 2,
    },
  },
  sm: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14, // was 0.10
      shadowRadius: 6,
      elevation: 3,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.44, // was 0.20
      shadowRadius: 6,
      elevation: 3,
    },
  },
  md: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18, // was 0.14
      shadowRadius: 12,
      elevation: 6,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.54, // was 0.24
      shadowRadius: 12,
      elevation: 6,
    },
  },
  lg: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22, // was 0.18
      shadowRadius: 20,
      elevation: 10,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.64, // was 0.28
      shadowRadius: 20,
      elevation: 10,
    },
  },
  elevated: {
    // For surface.elevated (modals, full-screen sheets).
    // Significantly stronger than lg — the modal layer must read above cards.
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.28,
      shadowRadius: 36,
      elevation: 18,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.8,
      shadowRadius: 36,
      elevation: 18,
    },
  },
} as const;

export type ShadowsMobileVariant = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export type ShadowsWebTheme = {
  focus: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  elevated: string;
  top: string;
};

export type ShadowsMobileTheme = {
  xs: ShadowsMobileVariant;
  sm: ShadowsMobileVariant;
  md: ShadowsMobileVariant;
  lg: ShadowsMobileVariant;
  elevated: ShadowsMobileVariant;
};

export function createShadows(mode: "light" | "dark", platform: "web"): ShadowsWebTheme;
export function createShadows(mode: "light" | "dark", platform: "mobile"): ShadowsMobileTheme;
export function createShadows(
  mode: "light" | "dark",
  platform: "web" | "mobile",
): ShadowsWebTheme | ShadowsMobileTheme {
  const isLight = mode === "light";

  if (platform === "web") {
    return {
      focus: isLight ? shadowsShared.focus.light : shadowsShared.focus.dark,
      xs: isLight ? shadowsWeb.xs.light : shadowsWeb.xs.dark,
      sm: isLight ? shadowsWeb.sm.light : shadowsWeb.sm.dark,
      md: isLight ? shadowsWeb.md.light : shadowsWeb.md.dark,
      lg: isLight ? shadowsWeb.lg.light : shadowsWeb.lg.dark,
      elevated: isLight ? shadowsWeb.elevated.light : shadowsWeb.elevated.dark,
      top: isLight ? shadowsWeb.top.light : shadowsWeb.top.dark,
    };
  }

  return {
    xs: isLight ? shadowsMobile.xs.light : shadowsMobile.xs.dark,
    sm: isLight ? shadowsMobile.sm.light : shadowsMobile.sm.dark,
    md: isLight ? shadowsMobile.md.light : shadowsMobile.md.dark,
    lg: isLight ? shadowsMobile.lg.light : shadowsMobile.lg.dark,
    elevated: isLight ? shadowsMobile.elevated.light : shadowsMobile.elevated.dark,
  };
}

export const shadows = {
  shared: shadowsShared,
  web: shadowsWeb,
  mobile: shadowsMobile,
  create: createShadows,
} as const;

export type ShadowsShared = typeof shadowsShared;
export type ShadowsWeb = typeof shadowsWeb;
export type ShadowsMobile = typeof shadowsMobile;
export type AppShadows = ReturnType<typeof createShadows>;
