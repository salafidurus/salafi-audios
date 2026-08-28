/** Shared typography roles and responsive measurements for web and native consumers. */
/** Supported numeric font weights used by the typography token map. */
export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

type FontRole = "display" | "body" | "mono";
type FontWeightKey = keyof typeof fontWeight;
type TypographyToken = {
  /** Semantic font role used to select the appropriate family. */
  fontRole: FontRole;
  fontSize: { web: string; mobile: number };
  lineHeight: { web: number; mobile: number };
  fontWeight: number;
  letterSpacing: { web: string; mobile: number };
};

/** Supported semantic typography variants exposed by the design system. */
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

/** Base typography measurements mapped by semantic variant. */
export const typographyBase = {
  displayLg: {
    fontRole: "display",
    fontSize: { web: "clamp(1.85rem, 3vw, 2.45rem)", mobile: 32 },
    lineHeight: { web: 1.15, mobile: 38 },
    fontWeight: fontWeight.semibold,
    letterSpacing: { web: "-0.02em", mobile: -0.64 },
  },
  displayMd: {
    fontRole: "display",
    fontSize: { web: "clamp(1.2rem, 2vw, 1.65rem)", mobile: 24 },
    lineHeight: { web: 1.2, mobile: 30 },
    fontWeight: fontWeight.semibold,
    letterSpacing: { web: "-0.01em", mobile: -0.24 },
  },
  titleLg: {
    fontRole: "body",
    fontSize: { web: "1.25rem", mobile: 20 },
    lineHeight: { web: 1.25, mobile: 26 },
    fontWeight: fontWeight.semibold,
    letterSpacing: { web: "-0.01em", mobile: -0.2 },
  },
  titleMd: {
    fontRole: "body",
    fontSize: { web: "1.1rem", mobile: 18 },
    lineHeight: { web: 1.3, mobile: 24 },
    fontWeight: fontWeight.medium,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  bodyLg: {
    fontRole: "body",
    fontSize: { web: "1.1rem", mobile: 18 },
    lineHeight: { web: 1.55, mobile: 28 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  bodyMd: {
    fontRole: "body",
    fontSize: { web: "1rem", mobile: 16 },
    lineHeight: { web: 1.5, mobile: 24 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  bodySm: {
    fontRole: "body",
    fontSize: { web: "0.9rem", mobile: 14 },
    lineHeight: { web: 1.45, mobile: 20 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0em", mobile: 0 },
  },
  labelMd: {
    fontRole: "body",
    fontSize: { web: "0.92rem", mobile: 14 },
    lineHeight: { web: 1.3, mobile: 18 },
    fontWeight: fontWeight.medium,
    letterSpacing: { web: "0.01em", mobile: 0.15 },
  },
  caption: {
    fontRole: "body",
    fontSize: { web: "0.8rem", mobile: 12 },
    lineHeight: { web: 1.3, mobile: 16 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0.01em", mobile: 0.12 },
  },
  xs: {
    fontRole: "body",
    fontSize: { web: "0.76rem", mobile: 10 },
    lineHeight: { web: 1.2, mobile: 12 },
    fontWeight: fontWeight.regular,
    letterSpacing: { web: "0.01em", mobile: 0.1 },
  },
} satisfies Record<TypographyVariant, TypographyToken>;

/** Maps a numeric font weight to the nearest supported semantic weight key. */
export const getWeightKey = (weight: number): FontWeightKey => {
  switch (weight) {
    case 400:
      return "regular";
    case 500:
      return "medium";
    case 600:
      return "semibold";
    case 700:
      return "bold";
    default:
      return "regular";
  }
};
