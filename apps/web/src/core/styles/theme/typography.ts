import { typographyBase, type TypographyVariant } from "@sd/design-tokens";

/** Documents this module's responsibility and public boundary. */
const webFontFamily = {
  display: "var(--font-display), serif",
  body: "var(--font-body), sans-serif",
  mono: "var(--font-mono), monospace",
} as const;

const getWebFontFamily = (role: "display" | "body" | "mono"): string => {
  switch (role) {
    case "display":
      return webFontFamily.display;
    case "body":
      return webFontFamily.body;
    case "mono":
      return webFontFamily.mono;
    default:
      return webFontFamily.body;
  }
};

/** Converts shared typography tokens into CSS-ready web font and spacing values. */
export const createTypographyWeb = () => {
  // SAFETY: `typographyBase` already covers every `TypographyVariant`; this mapping preserves
  // the same keys while converting token values into concrete web typography primitives.
  return Object.fromEntries(
    Object.entries(typographyBase).map(([variant, token]) => [
      variant,
      {
        fontFamily: getWebFontFamily(token.fontRole),
        fontSize: token.fontSize.web,
        lineHeight: token.lineHeight.web,
        fontWeight: token.fontWeight,
        letterSpacing: token.letterSpacing.web,
      },
    ]),
  ) as Record<
    TypographyVariant,
    {
      fontFamily: string;
      fontSize: string;
      lineHeight: number;
      fontWeight: number;
      letterSpacing: string;
    }
  >;
};

/** Materialized web typography tokens consumed by theme generation. */
export const typographyWeb = createTypographyWeb();

/** Inferred shape of the materialized web typography token collection. */
export type TypographyWeb = typeof typographyWeb;
