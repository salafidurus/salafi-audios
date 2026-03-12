export const radiusShared = {
  chip: "999px",
} as const;

export const radiusWeb = {
  panel: "1rem",
  panelSm: "0.75rem",
  card: "0.9rem",
} as const;

export const radiusMobile = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const radius = {
  ...radiusShared,
  ...radiusWeb,
  ...radiusMobile,
} as const;

export type Radius = typeof radius;
export type RadiusShared = typeof radiusShared;
export type RadiusWeb = typeof radiusWeb;
export type RadiusMobile = typeof radiusMobile;
