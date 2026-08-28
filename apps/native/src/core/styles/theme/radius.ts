/** Provides the native core styles theme radius module responsibility. */
/** Describes the const radiusNative = { native declaration contract and behavior. */
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

/** Describes the RadiusNative native type contract and behavior. */
export type RadiusNative = typeof radiusNative;
