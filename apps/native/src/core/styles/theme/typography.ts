import { typographyBase, getWeightKey, type TypographyVariant } from "@sd/design-tokens";

/** Provides the native core styles theme typography module responsibility. */
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

type TypographyVariantConfig = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

function createVariantConfig(locale: Locale, variant: TypographyVariant): TypographyVariantConfig {
  const token = typographyBase[variant];
  const weightKey = getWeightKey(token.fontWeight);

  return {
    fontFamily: getNativeFontFamily(locale, token.fontRole, weightKey),
    fontSize: token.fontSize.mobile,
    lineHeight: token.lineHeight.mobile,
    letterSpacing: token.letterSpacing.mobile,
  };
}

/** Describes the const createTypography = ( native declaration contract and behavior. */
export const createTypography = (
  locale: Locale = "en",
): Record<TypographyVariant, TypographyVariantConfig> => {
  // SAFETY: typographyBase is the canonical source of every TypographyVariant
  // key, so enumerating its own keys yields the full variant set for this record.
  const variants = Object.keys(typographyBase) as TypographyVariant[];

  // SAFETY: the reducer assigns every TypographyVariant from the canonical list
  // above before returning, so the final object satisfies the full record.
  return variants.reduce<Record<TypographyVariant, TypographyVariantConfig>>(
    (acc, variant) => {
      acc[variant] = createVariantConfig(locale, variant);
      return acc;
    },
    {} as Record<TypographyVariant, TypographyVariantConfig>,
  );
};

/** Describes the const typographyNative = createTypography("en"); native declaration contract and behavior. */
export const typographyNative = createTypography("en");

/** Describes the TypographyNative native type contract and behavior. */
export type TypographyNative = typeof typographyNative;
