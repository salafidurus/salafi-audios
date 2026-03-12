export const fontSizeShared = {
  body: "1rem",
  caption: "0.8rem",
  xs: "0.76rem",
  sm: "0.9rem",
  md: "1rem",
  lg: "1.1rem",
  label: "0.92rem",
} as const;

export const fontSizeWeb = {
  h1: "clamp(1.85rem, 3vw, 2.45rem)",
  h2: "clamp(1.2rem, 2vw, 1.65rem)",
} as const;

export const fontSizeMobile = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 12,
  xs: 10,
  sm: 14,
  md: 16,
  lg: 18,
  label: 14,
} as const;

export const fontSize = {
  ...fontSizeShared,
  ...fontSizeWeb,
  ...fontSizeMobile,
} as const;

export const fontFamilyWeb = {
  display: "Fraunces, serif",
  body: "Manrope, sans-serif",
} as const;

export const fontFamilyMobile = {
  sans: "system-ui",
  serif: "ui-serif",
  rounded: "ui-rounded",
  mono: "ui-monospace",
} as const;

export const fontFamily = {
  ...fontFamilyWeb,
  ...fontFamilyMobile,
} as const;

export const fonts = {
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  rounded: "ui-rounded",
  mono: "ui-monospace",
} as const;

export const typography = {
  fontSize,
  fontFamily,
  fonts,
} as const;

export type Typography = typeof typography;
export type FontSize = typeof fontSize;
export type FontFamily = typeof fontFamily;
