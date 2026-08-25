import { UnistylesRuntime } from "react-native-unistyles";

import { createTypography } from "./typography";

type Locale = "en" | "ar";

export function syncTypographyToLocale(locale: Locale): void {
  const typography = createTypography(locale);
  const themes = ["system", "light", "dark"] as const;

  for (const theme of themes) {
    UnistylesRuntime.updateTheme(theme, (current) => ({
      ...current,
      typography,
    }));
  }
}
