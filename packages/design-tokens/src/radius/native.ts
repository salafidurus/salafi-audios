export const radiusMobile = {
  scale: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  component: {
    chip: 9999,
    card: 14,
    panelSm: 12,
    panel: 16,
  },
} as const;

export type RadiusMobile = typeof radiusMobile;
