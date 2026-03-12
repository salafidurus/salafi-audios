export const sharedColors = {
  primary: {
    50: "#E6FFFA",
    100: "#B2F5EA",
    150: "#9FEDE3",
    200: "#81E6D9",
    300: "#4FD1C5",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
    950: "#042F2E",
  },

  secondary: {
    50: "#FEFCE8",
    100: "#FEF9C3",
    150: "#FEF4A6",
    200: "#FEF08A",
    300: "#FDE047",
    400: "#FACC15",
    500: "#EAB308",
    600: "#CA8A04",
    700: "#A16207",
    800: "#854D0E",
    900: "#713F12",
    950: "#422006",
  },

  green: {
    50: "#e6fdea",
    100: "#b2f9bf",
    150: "#9cf8ad",
    200: "#8cf7a0",
    300: "#58f374",
    400: "#37f159",
    500: "#05ed30",
    600: "#05d82c",
    700: "#04a822",
    800: "#03821a",
    900: "#026414",
    950: "#012f0a",
  },

  red: {
    50: "#f9e6e6",
    100: "#edb0b0",
    150: "#ef9a9a",
    200: "#e49a8a",
    300: "#e27a84",
    400: "#d03333",
    500: "#c40000",
    600: "#b20000",
    700: "#8b0000",
    800: "#6c0000",
    900: "#520000",
    950: "#290000",
  },

  slate: {
    50: "#f8f9fa",
    100: "#fbfbfb",
    150: "#f9f9f9",
    200: "#f6f6f6",
    300: "#e0e0e0",
    400: "#afafaf",
    500: "#878787",
    600: "#676767",
    700: "#606060",
    800: "#414141",
    900: "#121212",
    950: "#080808",
  },
} as const;

export const createColors = (mode: "light" | "dark") => {
  const c = sharedColors;
  const isLight = mode === "light";

  return {
    surface: isLight
      ? {
          canvas: c.slate[50],
          default: c.slate[150],
          subtle: c.slate[100],
          elevated: c.slate[200],
          hover: c.slate[200],
          inverse: c.slate[900],

          primarySubtle: c.primary[100],
          secondarySubtle: c.secondary[100],

          selected: c.primary[150],
          disabled: c.slate[100],
        }
      : {
          canvas: c.slate[950],
          default: c.slate[900],
          subtle: c.slate[800],
          elevated: c.slate[700],
          hover: c.slate[600],
          inverse: c.slate[50],

          primarySubtle: c.primary[900],
          secondarySubtle: c.secondary[900],

          selected: c.primary[900],
          disabled: c.slate[800],
        },

    content: isLight
      ? {
          default: c.slate[700],
          muted: c.slate[500],
          subtle: c.slate[600],
          strong: c.slate[900],
          inverse: c.slate[50],

          primary: c.primary[700],
          primaryStrong: c.primary[900],
          secondary: c.secondary[700],
          secondaryStrong: c.secondary[900],

          onPrimary: c.slate[950],
          onSecondary: c.slate[950],
          onDanger: c.slate[50],
          onSuccess: c.slate[950],

          disabled: c.slate[400],
        }
      : {
          default: c.slate[100],
          muted: c.slate[400],
          subtle: c.slate[300],
          strong: c.slate[50],
          inverse: c.slate[900],

          primary: c.primary[100],
          primaryStrong: c.primary[50],
          secondary: c.secondary[100],
          secondaryStrong: c.secondary[50],

          onPrimary: c.slate[950],
          onSecondary: c.slate[950],
          onDanger: c.slate[50],
          onSuccess: c.slate[950],

          disabled: c.slate[500],
        },

    border: isLight
      ? {
          default: c.slate[200],
          subtle: c.slate[100],
          strong: c.slate[400],
          muted: c.slate[50],
          hover: c.slate[300],

          focus: c.primary[400],

          primary: c.primary[200],
          primaryStrong: c.primary[400],
          secondary: c.secondary[200],
          secondaryStrong: c.secondary[400],

          disabled: c.slate[200],
        }
      : {
          default: c.slate[700],
          subtle: c.slate[800],
          strong: c.slate[500],
          muted: c.slate[900],
          hover: c.slate[600],

          focus: c.primary[300],

          primary: c.primary[700],
          primaryStrong: c.primary[500],
          secondary: c.secondary[700],
          secondaryStrong: c.secondary[500],

          disabled: c.slate[800],
        },

    action: isLight
      ? {
          primary: c.primary[500],
          primaryHover: c.primary[600],
          primaryActive: c.primary[700],

          secondary: c.secondary[500],
          secondaryHover: c.secondary[600],
          secondaryActive: c.secondary[700],

          danger: c.red[500],
          dangerHover: c.red[600],
          dangerActive: c.red[700],

          success: c.green[500],
          successHover: c.green[600],
          successActive: c.green[700],

          disabled: c.slate[200],
          disabledContent: c.slate[400],
        }
      : {
          primary: c.primary[500],
          primaryHover: c.primary[400],
          primaryActive: c.primary[300],

          secondary: c.secondary[500],
          secondaryHover: c.secondary[400],
          secondaryActive: c.secondary[300],

          danger: c.red[600],
          dangerHover: c.red[500],
          dangerActive: c.red[400],

          success: c.green[600],
          successHover: c.green[500],
          successActive: c.green[400],

          disabled: c.slate[800],
          disabledContent: c.slate[500],
        },

    state: isLight
      ? {
          success: c.green[700],
          successSurface: c.green[100],
          successBorder: c.green[300],
          successContent: c.green[800],

          danger: c.red[700],
          dangerSurface: c.red[100],
          dangerBorder: c.red[300],
          dangerContent: c.red[800],
        }
      : {
          success: c.green[400],
          successSurface: c.green[900],
          successBorder: c.green[700],
          successContent: c.green[100],

          danger: c.red[400],
          dangerSurface: c.red[900],
          dangerBorder: c.red[700],
          dangerContent: c.red[100],
        },
  };
};

export type SharedColors = typeof sharedColors;
export type AppColors = ReturnType<typeof createColors>;
