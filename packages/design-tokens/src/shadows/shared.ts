export const shadowsShared = {
  focus: {
    light: "0 0 0 3px rgb(20 184 166 / 0.28)",
    dark: "0 0 0 3px rgb(45 212 191 / 0.36)",
  },
} as const;

export type ShadowsShared = typeof shadowsShared;
