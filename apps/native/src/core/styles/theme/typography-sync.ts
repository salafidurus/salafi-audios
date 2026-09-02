import { UnistylesRuntime } from "react-native-unistyles";

import { createTypography } from "./typography";

/** Configures native themes, breakpoints, and the Unistyles runtime. */
type Locale = "en" | "ar";

/** Defines the native sync typography to locale contract used by this module. */
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
