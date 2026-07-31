import { isRtl, type Locale } from "@sd/core-i18n";
import { UnistylesRuntime } from "react-native-unistyles";

export function syncDirectionToLocale(locale: Locale): void {
  const direction = isRtl(locale) ? "rtl" : "ltr";

  UnistylesRuntime.updateTheme("light", (current) => ({
    ...current,
    direction,
  }));

  UnistylesRuntime.updateTheme("dark", (current) => ({
    ...current,
    direction,
  }));
}
