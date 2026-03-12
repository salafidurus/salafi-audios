export const sharedColors = {
  // DESIGN TOKENS
  primary: {
    50: "#fef2e7",
    100: "#fdd8b3",
    200: "#fcc58f",
    300: "#faab5c",
    400: "#f99a3c",
    500: "#f8810b",
    600: "#e2750a",
    700: "#b05c08",
    800: "#884706",
    900: "#683605",
  },

  secondary: {
    50: "#e7eaf4",
    100: "#b4bedc",
    200: "#909ecb",
    300: "#5e72b3",
    400: "#3e56a5",
    500: "#0e2c8e",
    600: "#0d2881",
    700: "#0a1f65",
    800: "#08184e",
    900: "#06123c",
  },

  white: {
    50: "#fefefe",
    100: "#fcfcfc",
    200: "#fbfbfb",
    300: "#f9f9f9",
    400: "#f8f8f8",
    500: "#f6f6f6",
    600: "#e0e0e0",
    700: "#afafaf",
    800: "#878787",
    900: "#676767",
  },

  black: {
    50: "#e7e7e7",
    100: "#b6b6b6",
    200: "#929292",
    300: "#606060",
    400: "#414141",
    500: "#121212",
    600: "#101010",
    700: "#0d0d0d",
    800: "#0a0a0a",
    900: "#080808",
  },

  green: {
    50: "#e6fdea",
    100: "#b2f9bf",
    200: "#8cf7a0",
    300: "#58f374",
    400: "#37f159",
    500: "#05ed30",
    600: "#05d82c",
    700: "#04a822",
    800: "#03821a",
    900: "#026414",
  },

  red: {
    50: "#f9e6e6",
    100: "#edb0b0",
    200: "#e48a8a",
    300: "#d75454",
    400: "#d03333",
    500: "#c40000",
    600: "#b20000",
    700: "#8b0000",
    800: "#6c0000",
    900: "#520000",
  },

  /**
   * BACKWARDS-COMPAT ALIASES
   * Keep your existing usage working while migrating.
   */
  information: {} as any,
  success: {} as any,
  error: {} as any,
  warning: {
    // Your design system didn’t include a yellow scale in what you pasted.
    // Keeping your existing warning scale so nothing breaks.
    100: "#FEF2D3",
    150: "#FEECBD",
    200: "#FDE5A7",
    300: "#FDD97C",
    400: "#FCCC50",
    500: "#FBBF24",
    600: "#C9991D",
  },

  /**
   * Neutrals for existing "slate" usage
   * We map slate to a practical light-to-dark ramp using white/black tokens.
   * You can refine this later if design provides a dedicated slate scale.
   */
  slate: {
    100: "#fbfbfb", // white-200
    150: "#f9f9f9", // white-300
    200: "#f6f6f6", // white-500
    300: "#e0e0e0", // white-600
    400: "#afafaf", // white-700
    500: "#878787", // white-800
    600: "#676767", // white-900
    700: "#606060", // black-300
    800: "#414141", // black-400
    900: "#121212", // black-500
    950: "#080808", // black-900
  },

  neutral: {
    // Keep a few of your old convenience keys
    100: "#fbfbfb",
    150: "#f9f9f9",
    500: "#878787",
    gray500: "#939393",
    grey200: "rgba(212, 212, 212, 1)",
  },

  misc: {
    // If you were using these as “blues”, point them at secondary
    blue1_500: "#0e2c8e", // secondary-500
    blue2_500: "#0a1f65", // secondary-700
    blue400: "#3e56a5", // secondary-400

    bgShade: "#f9f9f9", // white-300
    blueShade: "#b4bedc", // secondary-100
    filesBg: "#fbfbfb", // white-200
    detailsBg: "#b4bedc", // secondary-100
    whenInactive: "rgba(238, 242, 255, 1)", // leave as-is (custom)
    dividerColor: "rgba(243, 244, 246, 1)", // leave as-is (custom)
    orderStateBg: "#909ecb", // secondary-200
    vendorBg: "rgba(239, 246, 255, 1)", // leave as-is (custom)
    vendorBorder: "rgba(219, 234, 254, 1)", // leave as-is (custom)
    textWeightCol: "#878787", // white-800
  },
} as const;

// fill aliases (must be after sharedColors exists)
(sharedColors as any).information = sharedColors.secondary;
(sharedColors as any).success = sharedColors.green;
(sharedColors as any).error = sharedColors.red;

export const lightTheme = {
  colors: {
    ...sharedColors,

    // surfaces
    surfacePage: sharedColors.white[50],
    surfaceDefault: sharedColors.white[50],
    surfaceDefaultSecondary: sharedColors.white[300],
    surfaceSecondary: sharedColors.white[300],

    // Auth Header
    surfaceAuthPageStart: sharedColors.primary[300],
    surfaceAuthPageMid: sharedColors.primary[400],
    surfaceAuthPageEnd: sharedColors.primary[500],

    // text
    textDefaultHeading: sharedColors.black[900],
    textDefaultBody: sharedColors.black[500],
    textDefaultCaption: sharedColors.black[300],
    textDefaultPlaceholder: sharedColors.white[900],

    textOnColorHeading: sharedColors.white[50],
    textOnColorBody: sharedColors.white[50],
    textOnColorCaption: sharedColors.white[200],
    textOnColorPlaceholder: sharedColors.white[300],

    // primary / secondary shortcuts
    primaryDefault: sharedColors.primary[500],
    primaryDefaultHover: sharedColors.primary[400],
    primaryDefaultSubtle: sharedColors.primary[100],

    secondaryDefault: sharedColors.secondary[500],
    secondaryDefaultHover: sharedColors.secondary[400],
    secondaryDefaultSubtle: sharedColors.secondary[100],

    // icons & borders
    iconPrimaryDefault: sharedColors.primary[500],
    iconPrimaryDefaultHover: sharedColors.primary[400],
    iconPrimaryOnColor: sharedColors.white[50],

    borderDefault: sharedColors.white[600],
    borderDefaultSecondary: sharedColors.white[600],
    borderPrimaryDefault: sharedColors.primary[500],
    borderPrimaryDefaultHover: sharedColors.primary[600],
    borderPrimaryDefaultSubtle: sharedColors.primary[100],

    borderErrorDefault: sharedColors.red[500],
    borderErrorDefaultHover: sharedColors.red[600],

    // semantic surfaces
    surfacePrimaryDefault: sharedColors.primary[500],
    surfaceErrorDefault: sharedColors.red[500],
    surfaceInformationDefault: sharedColors.secondary[500],
    surfaceWarningDefault: sharedColors.warning[500],
    surfaceSuccessDefault: sharedColors.green[500],

    // backwards compat
    typography: sharedColors.black[900],
    background: sharedColors.white[50],
  },
  margins: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
  },
} as const;

export const darkTheme = {
  colors: {
    ...sharedColors,

    surfacePage: sharedColors.black[900],
    surfaceDefault: sharedColors.black[900],
    surfaceSecondary: sharedColors.black[700],

    // Auth Header
    surfaceAuthPageStart: sharedColors.primary[300],
    surfaceAuthPageMid: sharedColors.primary[400],
    surfaceAuthPageEnd: sharedColors.primary[500],

    textDefaultHeading: sharedColors.white[50],
    textDefaultBody: sharedColors.white[300],
    textDefaultCaption: sharedColors.white[600],
    textDefaultPlaceholder: sharedColors.white[800],

    textOnColorHeading: sharedColors.white[50],
    textOnColorBody: sharedColors.white[100],
    textOnColorCaption: sharedColors.white[300],
    textOnColorPlaceholder: sharedColors.white[600],

    primaryDefault: sharedColors.primary[500],
    primaryDefaultHover: sharedColors.primary[400],
    primaryDefaultSubtle: sharedColors.primary[700], // subtle in dark = deeper tone

    secondaryDefault: sharedColors.secondary[500],
    secondaryDefaultHover: sharedColors.secondary[400],
    secondaryDefaultSubtle: sharedColors.secondary[700],

    borderDefault: sharedColors.black[400],
    borderDefaultSecondary: sharedColors.black[400],
    borderPrimaryDefault: sharedColors.primary[500],
    borderPrimaryDefaultHover: sharedColors.primary[600],
    borderPrimaryDefaultSubtle: sharedColors.primary[700],

    borderErrorDefault: sharedColors.red[500],
    borderErrorDefaultHover: sharedColors.red[600],

    surfacePrimaryDefault: sharedColors.primary[500],
    surfaceErrorDefault: sharedColors.red[500],
    surfaceInformationDefault: sharedColors.secondary[500],
    surfaceWarningDefault: sharedColors.warning[500],
    surfaceSuccessDefault: sharedColors.green[500],

    typography: sharedColors.white[50],
    background: sharedColors.black[900],
  },
  margins: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
  },
} as const;

export type Theme = typeof lightTheme;
export default { lightTheme, darkTheme, sharedColors };
