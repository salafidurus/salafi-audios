export const shadowsShared = {
  focus: {
    light: "0 0 0 3px rgb(20 184 166 / 0.28)",
    dark: "0 0 0 3px rgb(45 212 191 / 0.36)",
  },
} as const;

export const shadowsWeb = {
  xs: {
    light: "0 1px 2px rgb(15 23 42 / 0.06)",
    dark: "0 1px 2px rgb(0 0 0 / 0.28)",
  },
  sm: {
    light: "0 4px 10px -6px rgb(15 23 42 / 0.10)",
    dark: "0 4px 10px -6px rgb(0 0 0 / 0.34)",
  },
  md: {
    light: "0 10px 24px -12px rgb(15 23 42 / 0.16)",
    dark: "0 12px 28px -14px rgb(0 0 0 / 0.42)",
  },
  lg: {
    light: "0 20px 40px -18px rgb(15 23 42 / 0.22)",
    dark: "0 24px 48px -20px rgb(0 0 0 / 0.52)",
  },
  top: {
    light: "0 -20px 42px -30px rgb(15 23 42 / 0.18)",
    dark: "0 -24px 52px -36px rgb(0 0 0 / 0.56)",
  },
} as const;

export const shadowsMobile = {
  xs: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  sm: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  md: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 8,
      elevation: 4,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.24,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  lg: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    },
    dark: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 16,
      elevation: 8,
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

export type ShadowsWebTheme = {
  focus: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  top: string;
};

export type ShadowsMobileTheme = {
  xs: ShadowsMobileVariant;
  sm: ShadowsMobileVariant;
  md: ShadowsMobileVariant;
  lg: ShadowsMobileVariant;
};

export function createShadows(mode: "light" | "dark", platform: "web"): ShadowsWebTheme;
export function createShadows(mode: "light" | "dark", platform: "mobile"): ShadowsMobileTheme;
export function createShadows(
  mode: "light" | "dark",
  platform: "web" | "mobile",
): ShadowsWebTheme | ShadowsMobileTheme {
  const isLight = mode === "light";

  if (platform === "web") {
    return {
      focus: isLight ? shadowsShared.focus.light : shadowsShared.focus.dark,
      xs: isLight ? shadowsWeb.xs.light : shadowsWeb.xs.dark,
      sm: isLight ? shadowsWeb.sm.light : shadowsWeb.sm.dark,
      md: isLight ? shadowsWeb.md.light : shadowsWeb.md.dark,
      lg: isLight ? shadowsWeb.lg.light : shadowsWeb.lg.dark,
      top: isLight ? shadowsWeb.top.light : shadowsWeb.top.dark,
    };
  }

  return {
    xs: isLight ? shadowsMobile.xs.light : shadowsMobile.xs.dark,
    sm: isLight ? shadowsMobile.sm.light : shadowsMobile.sm.dark,
    md: isLight ? shadowsMobile.md.light : shadowsMobile.md.dark,
    lg: isLight ? shadowsMobile.lg.light : shadowsMobile.lg.dark,
  };
}

export const shadows = {
  shared: shadowsShared,
  web: shadowsWeb,
  mobile: shadowsMobile,
  create: createShadows,
} as const;

export type ShadowsShared = typeof shadowsShared;
export type ShadowsWeb = typeof shadowsWeb;
export type ShadowsMobile = typeof shadowsMobile;
export type AppShadows = ReturnType<typeof createShadows>;
