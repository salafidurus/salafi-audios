import { typographyBase, getWeightKey, type TypographyVariant } from "@sd/design-tokens";

/** Configures native themes, breakpoints, and the Unistyles runtime. */
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
  fontWeight: "400" | "500" | "600" | "700";
  lineHeight: number;
  letterSpacing: number;
};

function createVariantConfig(locale: Locale, variant: TypographyVariant): TypographyVariantConfig {
  const token = typographyBase[variant];
  const weightKey = getWeightKey(token.fontWeight);

  return {
    fontFamily: getNativeFontFamily(locale, token.fontRole, weightKey),
    fontSize: token.fontSize.mobile,
    // SAFETY: design tokens restrict native weights to regular, medium,
    // semibold, and bold, which map to these four UniversalTextStyle values.
    fontWeight: String(token.fontWeight) as TypographyVariantConfig["fontWeight"],
    lineHeight: token.lineHeight.mobile,
    letterSpacing: token.letterSpacing.mobile,
  };
}

/** Builds the native typography theme values from the active platform mode. */
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

/** Defines the native typography token set consumed by themed components. */
export const typographyNative = createTypography("en");

/** Defines shared native typography tokens consumed by the application theme. */
export type TypographyNative = typeof typographyNative;
