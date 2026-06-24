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

export type RadiusWeb = typeof radiusWeb;
