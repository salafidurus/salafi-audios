import { shadowsShared } from "./shared";

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

export type ShadowsWebTheme = {
  focus: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  elevated: string;
  top: string;
};

export const createShadowsWeb = (mode: "light" | "dark"): ShadowsWebTheme => {
  const isLight = mode === "light";

  return {
    focus: isLight ? shadowsShared.focus.light : shadowsShared.focus.dark,
    xs: isLight ? shadowsWeb.xs.light : shadowsWeb.xs.dark,
    sm: isLight ? shadowsWeb.sm.light : shadowsWeb.sm.dark,
    md: isLight ? shadowsWeb.md.light : shadowsWeb.md.dark,
    lg: isLight ? shadowsWeb.lg.light : shadowsWeb.lg.dark,
    elevated: isLight ? shadowsWeb.elevated.light : shadowsWeb.elevated.dark,
    top: isLight ? shadowsWeb.top.light : shadowsWeb.top.dark,
  };
};

export type ShadowsWeb = typeof shadowsWeb;
