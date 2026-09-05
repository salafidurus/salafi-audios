/** Documents this module's responsibility and public boundary. */
/** Focus-ring shadows shared by the light and dark web themes. */
export const shadowsShared = {
  focus: {
    light: "0 0 0 3px rgb(20 184 166 / 0.28)",
    dark: "0 0 0 3px rgb(45 212 191 / 0.36)",
  },
} as const;

/** Raw light/dark elevation shadows used to build the web theme. */
export const shadowsWeb = {
  xs: {
    light: "0 1px 3px rgb(15 23 42 / 0.10)",
    dark: "0 1px 3px rgb(0 0 0 / 0.40)",
  },
  sm: {
    light: "0 4px 12px -4px rgb(15 23 42 / 0.16)",
    dark: "0 4px 12px -4px rgb(0 0 0 / 0.52)",
  },
  md: {
    light: "0 10px 28px -10px rgb(15 23 42 / 0.22)",
    dark: "0 12px 32px -12px rgb(0 0 0 / 0.60)",
  },
  lg: {
    light: "0 20px 44px -16px rgb(15 23 42 / 0.28)",
    dark: "0 24px 56px -18px rgb(0 0 0 / 0.70)",
  },
  elevated: {
    light: "0 32px 64px -20px rgb(15 23 42 / 0.36), 0 0 0 0.5px rgb(15 23 42 / 0.06)",
    dark: "0 32px 64px -20px rgb(0 0 0 / 0.80), 0 0 0 0.5px rgb(255 255 255 / 0.06)",
  },
  top: {
    light: "0 -20px 42px -30px rgb(15 23 42 / 0.22)",
    dark: "0 -24px 52px -36px rgb(0 0 0 / 0.68)",
  },
} as const;

/** Resolved shadow values for one selected web color mode. */
export type ShadowsWebTheme = {
  focus: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  elevated: string;
  top: string;
};

/** Resolves the shared and elevation shadows for the requested color mode. */
export const createShadowsWeb = (mode: "light" | "dark"): ShadowsWebTheme => {
  return {
    focus: selectShadow(mode, shadowsShared.focus),
    xs: selectShadow(mode, shadowsWeb.xs),
    sm: selectShadow(mode, shadowsWeb.sm),
    md: selectShadow(mode, shadowsWeb.md),
    lg: selectShadow(mode, shadowsWeb.lg),
    elevated: selectShadow(mode, shadowsWeb.elevated),
    top: selectShadow(mode, shadowsWeb.top),
  };
};

function selectShadow(mode: "light" | "dark", shadow: { light: string; dark: string }): string {
  return mode === "light" ? shadow.light : shadow.dark;
}
