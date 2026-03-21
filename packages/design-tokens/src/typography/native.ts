import { typographyBase, weightToKey, type TypographyVariant } from "./shared";

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

export const createTypographyMobile = () => {
  return Object.fromEntries(
    Object.entries(typographyBase).map(([variant, token]) => {
      const weightKey = weightToKey[token.fontWeight];
      return [
        variant,
        {
          fontFamily: mobileFontFamily[token.fontRole][weightKey],
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

export const typographyMobile = createTypographyMobile();

export type TypographyMobile = typeof typographyMobile;
