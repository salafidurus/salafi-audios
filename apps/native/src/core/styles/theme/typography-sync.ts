import { UnistylesRuntime } from "react-native-unistyles";

import { createTypography } from "./typography";

/** Provides the native core styles theme typography-sync module responsibility. */
type Locale = "en" | "ar";

/** Describes the syncTypographyToLocale native function contract and behavior. */
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
