import { typographyBase, getWeightKey, type TypographyVariant } from "@sd/design-tokens";

type Locale = "en" | "ar";

const fontFamilies = {
  en: {
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
  },
  ar: {
    display: {
      regular: "Alexandria-Regular",
      medium: "Alexandria-Medium",
      semibold: "Alexandria-SemiBold",
      bold: "Alexandria-Bold",
    },
    body: {
      regular: "IBMPlexSansArabic-Regular",
      medium: "IBMPlexSansArabic-Medium",
      semibold: "IBMPlexSansArabic-SemiBold",
      bold: "IBMPlexSansArabic-Bold",
    },
  },
} as const;

const monoFamily = {
  regular: "GeistMono-Regular",
  medium: "GeistMono-Medium",
  semibold: "GeistMono-SemiBold",
  bold: "GeistMono-Bold",
} as const;

const getNativeFontFamily = (
  locale: Locale,
  role: "display" | "body" | "mono",
  weightKey: "regular" | "medium" | "semibold" | "bold",
): string => {
  if (role === "mono") {
    return monoFamily[weightKey];
  }
  return fontFamilies[locale][role][weightKey];
};

type TypographyVariantShape = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

export const createTypography = (
  locale: Locale = "en",
): Record<TypographyVariant, TypographyVariantShape> => {
  return Object.fromEntries(
    Object.entries(typographyBase).map(([variant, token]) => {
      const weightKey = getWeightKey(token.fontWeight);
      return [
        variant,
        {
          fontFamily: getNativeFontFamily(locale, token.fontRole, weightKey),
          fontSize: token.fontSize.mobile,
          lineHeight: token.lineHeight.mobile,
          letterSpacing: token.letterSpacing.mobile,
        },
      ];
    }),
  ) as Record<TypographyVariant, TypographyVariantShape>;
};

export const typographyNative = createTypography("en");
export const typographyArabic = createTypography("ar");

export type TypographyNative = typeof typographyNative;
