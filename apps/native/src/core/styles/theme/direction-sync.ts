import { isRtl, type Locale } from "@sd/core-i18n";
import { UnistylesRuntime } from "react-native-unistyles";

/** Configures native themes, breakpoints, and the Unistyles runtime. */
/** Defines the native sync direction to locale contract used by this module. */
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
