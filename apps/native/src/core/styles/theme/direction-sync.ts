import { isRtl, type Locale } from "@sd/core-i18n";
import { UnistylesRuntime } from "react-native-unistyles";

export function syncDirectionToLocale(locale: Locale): void {
  const direction = isRtl(locale) ? "rtl" : "ltr";
  const themes = ["system", "light", "dark"] as const;

  for (const theme of themes) {
    UnistylesRuntime.updateTheme(theme, (current) => ({
      ...current,
      direction,
    }));
  }
}
