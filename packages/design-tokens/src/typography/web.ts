import { typographyBase, type TypographyVariant } from "./shared";

const webFontFamily = {
  display: "var(--font-display), serif",
  body: "var(--font-body), sans-serif",
  mono: "var(--font-mono), monospace",
} as const;

export const createTypographyWeb = () => {
  return Object.fromEntries(
    Object.entries(typographyBase).map(([variant, token]) => [
      variant,
      {
        fontFamily: webFontFamily[token.fontRole],
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

export const typographyWeb = createTypographyWeb();

export type TypographyWeb = typeof typographyWeb;
