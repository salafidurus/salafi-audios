import { typographyBase, getWeightKey, type TypographyVariant } from "@sd/design-tokens";

/**
 * Fraunces does not have a Medium file in the current setup.
 * Medium intentionally falls back to semibold for display.
 */
const mobileFontFamily = {
  display: {
    regular: "Fraunces-Regular",
    medium: "Fraunces-SemiBold",
    semibold: "Fraunces-SemiBold",
    bold: "Fraunces-Bold",
  },
  body: {
    regular: "Manrope-Regular",
    medium: "Manrope-Medium",
    semibold: "Manrope-SemiBold",
    bold: "Manrope-Bold",
  },
  mono: {
    regular: "GeistMono-Regular",
    medium: "GeistMono-Medium",
    semibold: "GeistMono-SemiBold",
    bold: "GeistMono-Bold",
  },
} as const;

const getNativeFontFamily = (
  role: "display" | "body" | "mono",
  weightKey: "regular" | "medium" | "semibold" | "bold",
): string => {
  switch (role) {
    case "display":
      switch (weightKey) {
        case "regular":
          return mobileFontFamily.display.regular;
        case "medium":
          return mobileFontFamily.display.medium;
        case "semibold":
          return mobileFontFamily.display.semibold;
        case "bold":
          return mobileFontFamily.display.bold;
        default:
          return mobileFontFamily.display.regular;
      }
    case "body":
      switch (weightKey) {
        case "regular":
          return mobileFontFamily.body.regular;
        case "medium":
          return mobileFontFamily.body.medium;
        case "semibold":
          return mobileFontFamily.body.semibold;
        case "bold":
          return mobileFontFamily.body.bold;
        default:
          return mobileFontFamily.body.regular;
      }
    case "mono":
      switch (weightKey) {
        case "regular":
          return mobileFontFamily.mono.regular;
        case "medium":
          return mobileFontFamily.mono.medium;
        case "semibold":
          return mobileFontFamily.mono.semibold;
        case "bold":
          return mobileFontFamily.mono.bold;
        default:
          return mobileFontFamily.mono.regular;
      }
    default:
      return mobileFontFamily.body.regular;
  }
};

export const createTypographyNative = () => {
  return Object.fromEntries(
    Object.entries(typographyBase).map(([variant, token]) => {
      const weightKey = getWeightKey(token.fontWeight);
      return [
        variant,
        {
          fontFamily: getNativeFontFamily(token.fontRole, weightKey),
          fontSize: token.fontSize.mobile,
          lineHeight: token.lineHeight.mobile,
          letterSpacing: token.letterSpacing.mobile,
        },
      ];
    }),
  ) as Record<
    TypographyVariant,
    {
      fontFamily: string;
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
    }
  >;
};

export const typographyNative = createTypographyNative();

export type TypographyNative = typeof typographyNative;
