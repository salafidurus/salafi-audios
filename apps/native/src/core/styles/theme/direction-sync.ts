import { isRtl, type Locale } from "@sd/core-i18n";
import { UnistylesRuntime } from "react-native-unistyles";

/** Provides the native core styles theme direction-sync module responsibility. */
/** Describes the syncDirectionToLocale native function contract and behavior. */
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
