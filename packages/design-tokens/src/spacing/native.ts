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

export type SpacingMobile = typeof spacingMobile;
