export const shadowsNative = {
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

export type ShadowsNativeVariant = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export type ShadowsNativeTheme = {
  xs: ShadowsNativeVariant;
  sm: ShadowsNativeVariant;
  md: ShadowsNativeVariant;
  lg: ShadowsNativeVariant;
  elevated: ShadowsNativeVariant;
};

export const createShadowsNative = (mode: "light" | "dark"): ShadowsNativeTheme => {
  const isLight = mode === "light";

  return {
    xs: isLight ? shadowsNative.xs.light : shadowsNative.xs.dark,
    sm: isLight ? shadowsNative.sm.light : shadowsNative.sm.dark,
    md: isLight ? shadowsNative.md.light : shadowsNative.md.dark,
    lg: isLight ? shadowsNative.lg.light : shadowsNative.lg.dark,
    elevated: isLight ? shadowsNative.elevated.light : shadowsNative.elevated.dark,
  };
};

export type ShadowsNative = typeof shadowsNative;
