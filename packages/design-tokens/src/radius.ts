export const radiusWeb = {
  scale: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    full: "999px",
  },

  component: {
    chip: "999px",
    card: "0.9rem",
    panelSm: "0.75rem",
    panel: "1rem",
  },
} as const;

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

export function createRadius(platform: "web"): RadiusWeb;
export function createRadius(platform: "mobile"): RadiusMobile;
export function createRadius(platform: "web" | "mobile") {
  return platform === "web" ? radiusWeb : radiusMobile;
}

export type RadiusWeb = typeof radiusWeb;
export type RadiusMobile = typeof radiusMobile;
export type AppRadius = ReturnType<typeof createRadius>;
