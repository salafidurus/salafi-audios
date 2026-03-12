import { sharedColors } from "./colors";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { shadows, shadowsWeb, shadowsMobile } from "./shadows";
import { typography } from "./typography";

export const createTheme = (mode: "light" | "dark") => {
  const c = sharedColors;

  if (mode === "light") {
    return {
      colors: {
        bg: c.white[200],
        bgElevated: c.white[100],
        surface: c.white[50],
        surfaceSoft: c.green[50],
        surfaceElevated: c.white[100],
        surfaceHover: c.green[100],
        text: c.slate[900],
        textMuted: c.slate[500],
        textPrimary: c.slate[900],
        textSecondary: c.slate[500],
        textTertiary: c.slate[400],
        fillSecondary: c.green[50],
        fillTertiary: c.green[100],
        border: c.slate[300],
        borderSubtle: c.slate[200],
        borderStrong: c.slate[400],
        primary: c.green[500],
        primaryStrong: c.green[600],
        primarySoft: c.green[100],
        primaryHover: c.green[600],
        primaryAlt: c.green[50],
        primaryInk: c.green[900],
        link: c.green[700],
        danger: c.red[500],
      },
      spacing: spacing,
      radius: radius,
      shadows: {
        focus: shadows.focus.light,
        ...shadowsWeb,
        ...shadowsMobile,
      },
      fontSize: typography.fontSize,
      fontFamily: typography.fontFamily,
    };
  }

  return {
    colors: {
      bg: c.black[500],
      bgElevated: c.slate[800],
      surface: c.slate[800],
      surfaceSoft: c.slate[800],
      surfaceElevated: c.slate[800],
      surfaceHover: c.slate[700],
      text: c.slate[100],
      textMuted: c.slate[400],
      textPrimary: c.slate[100],
      textSecondary: c.slate[400],
      textTertiary: c.slate[500],
      fillSecondary: c.slate[700],
      fillTertiary: c.slate[700],
      border: c.slate[700],
      borderSubtle: c.slate[700],
      borderStrong: c.slate[600],
      primary: c.green[500],
      primaryStrong: c.green[400],
      primarySoft: c.green[900],
      primaryHover: c.green[400],
      primaryAlt: c.green[900],
      primaryInk: c.green[900],
      link: c.green[400],
      danger: c.red[400],
    },
    spacing: spacing,
    radius: radius,
    shadows: {
      focus: shadows.focus.dark,
      ...shadowsWeb,
      ...shadowsMobile,
    },
    fontSize: typography.fontSize,
    fontFamily: typography.fontFamily,
  };
};

export const lightTheme = createTheme("light");
export const darkTheme = createTheme("dark");

export const Colors = {
  light: {
    text: lightTheme.colors.text,
    background: lightTheme.colors.bg,
    tint: lightTheme.colors.primary,
    icon: lightTheme.colors.textMuted,
    tabIconDefault: lightTheme.colors.textMuted,
    tabIconSelected: lightTheme.colors.primary,
  },
  dark: {
    text: darkTheme.colors.text,
    background: darkTheme.colors.bg,
    tint: darkTheme.colors.primary,
    icon: darkTheme.colors.textMuted,
    tabIconDefault: darkTheme.colors.textMuted,
    tabIconSelected: darkTheme.colors.primary,
  },
} as const;

export type AppTheme = ReturnType<typeof createTheme>;
