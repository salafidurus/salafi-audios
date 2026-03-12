export const shadowsShared = {
  focus: {
    light: "0 0 0 3px rgb(76 227 110 / 0.25)",
    dark: "0 0 0 3px rgb(76 227 110 / 0.25)",
  },
} as const;

export const shadowsWeb = {
  panel: {
    light: "0 16px 36px -30px rgb(20 47 33 / 0.38)",
    dark: "0 20px 42px -30px rgb(0 0 0 / 0.65)",
  },
  card: {
    light: "0 10px 24px -20px rgb(20 47 33 / 0.3)",
    dark: "0 14px 26px -20px rgb(0 0 0 / 0.58)",
  },
  panelTop: {
    light: "0 -20px 42px -30px rgb(20 47 33 / 0.55)",
    dark: "0 -24px 52px -36px rgb(0 0 0 / 0.72)",
  },
  inline: {
    light: "0 8px 20px -18px rgb(20 47 33 / 0.35)",
    dark: "0 10px 26px -22px rgb(0 0 0 / 0.62)",
  },
} as const;

export const shadowsMobile = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const shadows = {
  ...shadowsShared,
  ...shadowsWeb,
  ...shadowsMobile,
} as const;

export type Shadows = typeof shadows;
export type ShadowsShared = typeof shadowsShared;
export type ShadowsWeb = typeof shadowsWeb;
export type ShadowsMobile = typeof shadowsMobile;
