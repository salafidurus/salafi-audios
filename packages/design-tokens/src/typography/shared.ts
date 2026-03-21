export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

type FontRole = "display" | "body" | "mono";
type FontWeightKey = keyof typeof fontWeight;

export type TypographyVariant =
  | "displayLg"
  | "displayMd"
  | "titleLg"
  | "titleMd"
  | "bodyLg"
  | "bodyMd"
  | "bodySm"
  | "labelMd"
  | "caption"
  | "xs";

export const typographyBase = {
  displayLg: {
    fontRole: "display" as FontRole,
    fontSize: { web: "clamp(1.85rem, 3vw, 2.45rem)", mobile: 32 },
    lineHeight: { web: 1.15, mobile: 38 },
    fontWeight: fontWeight.semibold,
    letterSpacing: { web: "-0.02em", mobile: -0.64 },
  },
  displayMd: {
    fontRole: "display" as FontRole,
    fontSize: { web: "clamp(1.2rem, 2vw, 1.65rem)", mobile: 24 },
    lineHeight: { web: 1.2, mobile: 30 },
    fontWeight: fontWeight.semibold,
    letterSpacing: { web: "-0.01em", mobile: -0.24 },
  },
  titleLg: {
    fontRole: "body" as FontRole,
    fontSize: { web: "1.25rem", mobile: 20 },
    lineHeight: { web: 1.25, mobile: 26 },
    fontWeight: fontWeight.semibold,
    letterSpacing: { web: "-0.01em", mobile: -0.2 },
  },
  titleMd: {
    fontRole: "body" as FontRole,
    fontSize: { web: "1.1rem", mobile: 18 },
    lineHeight: { web: 1.3, mobile: 24 },
    fontWeight: fontWeight.medium,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  bodyLg: {
    fontRole: "body" as FontRole,
    fontSize: { web: "1.1rem", mobile: 18 },
    lineHeight: { web: 1.55, mobile: 28 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  bodyMd: {
    fontRole: "body" as FontRole,
    fontSize: { web: "1rem", mobile: 16 },
    lineHeight: { web: 1.5, mobile: 24 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  bodySm: {
    fontRole: "body" as FontRole,
    fontSize: { web: "0.9rem", mobile: 14 },
    lineHeight: { web: 1.45, mobile: 20 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  labelMd: {
    fontRole: "body" as FontRole,
    fontSize: { web: "0.92rem", mobile: 14 },
    lineHeight: { web: 1.3, mobile: 18 },
    fontWeight: fontWeight.medium,
    letterSpacing: { web: "0.01em", mobile: 0.15 },
  },
  caption: {
    fontRole: "body" as FontRole,
    fontSize: { web: "0.8rem", mobile: 12 },
    lineHeight: { web: 1.3, mobile: 16 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0.01em", mobile: 0.12 },
  },
  xs: {
    fontRole: "body" as FontRole,
    fontSize: { web: "0.76rem", mobile: 10 },
    lineHeight: { web: 1.2, mobile: 12 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0.01em", mobile: 0.1 },
  },
} as const;

export const weightToKey: Record<number, FontWeightKey> = {
  400: "regular",
  500: "medium",
  600: "semibold",
  700: "bold",
};
