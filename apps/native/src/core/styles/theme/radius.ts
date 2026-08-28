/** Configures native themes, breakpoints, and the Unistyles runtime. */
/** Defines the native radius token set consumed by themed components. */
export const radiusNative = {
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

/** Defines shared native radius tokens consumed by the application theme. */
export type RadiusNative = typeof radiusNative;
