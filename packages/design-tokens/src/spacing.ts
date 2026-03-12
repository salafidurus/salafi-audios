export const spacingWeb = {
  scale: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    "4xl": "2.5rem",
  },

  layout: {
    pageX: "clamp(1.15rem, 3.8vw, 2.75rem)",
    pageY: "clamp(1.25rem, 3vw, 2rem)",
    sectionY: "clamp(1.2rem, 2vw, 1.8rem)",
    contentMax: "84rem",
  },

  component: {
    cardPadding: "1.05rem",
    panelPadding: "1.15rem",
    chipX: "0.72rem",
    chipY: "0.32rem",
    gapSm: "0.5rem",
    gapMd: "0.75rem",
    gapLg: "1rem",
    gapXl: "1.4rem",
  },
} as const;

export const spacingMobile = {
  scale: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
  },

  layout: {
    pageX: 20,
    pageY: 20,
    sectionY: 24,
    contentMax: "100%",
  },

  component: {
    cardPadding: 16,
    panelPadding: 18,
    chipX: 12,
    chipY: 6,
    gapSm: 8,
    gapMd: 12,
    gapLg: 16,
    gapXl: 20,
  },
} as const;

export function createSpacing(platform: "web"): SpacingWeb;
export function createSpacing(platform: "mobile"): SpacingMobile;
export function createSpacing(platform: "web" | "mobile") {
  return platform === "web" ? spacingWeb : spacingMobile;
}

export type SpacingWeb = typeof spacingWeb;
export type SpacingMobile = typeof spacingMobile;
export type AppSpacing = ReturnType<typeof createSpacing>;
