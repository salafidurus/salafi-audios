import { typographyBase, type TypographyVariant } from "./shared";

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

export const createTypographyWeb = () => {
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

export const typographyWeb = createTypographyWeb();

export type TypographyWeb = typeof typographyWeb;
