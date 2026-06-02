export const shadowsMobile = {
  xs: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 2,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.36,
      shadowRadius: 3,
      elevation: 2,
    },
  },
  sm: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.14,
      shadowRadius: 6,
      elevation: 3,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.44,
      shadowRadius: 6,
      elevation: 3,
    },
  },
  md: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 6,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.54,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  lg: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
      elevation: 10,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.64,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  elevated: {
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

export type ShadowsMobileTheme = {
  xs: ShadowsMobileVariant;
  sm: ShadowsMobileVariant;
  md: ShadowsMobileVariant;
  lg: ShadowsMobileVariant;
  elevated: ShadowsMobileVariant;
};

export const createShadowsMobile = (mode: "light" | "dark"): ShadowsMobileTheme => {
  const isLight = mode === "light";

  return {
    xs: isLight ? shadowsMobile.xs.light : shadowsMobile.xs.dark,
    sm: isLight ? shadowsMobile.sm.light : shadowsMobile.sm.dark,
    md: isLight ? shadowsMobile.md.light : shadowsMobile.md.dark,
    lg: isLight ? shadowsMobile.lg.light : shadowsMobile.lg.dark,
    elevated: isLight ? shadowsMobile.elevated.light : shadowsMobile.elevated.dark,
  };
};

export type ShadowsMobile = typeof shadowsMobile;
