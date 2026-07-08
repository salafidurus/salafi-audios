import { UnistylesRuntime } from "react-native-unistyles";
import { createTypography } from "./typography";

type Locale = "en" | "ar";

export function syncTypographyToLocale(locale: Locale): void {
  const typography = createTypography(locale);

  UnistylesRuntime.updateTheme("light", (current) => ({
    ...current,
    typography,
  }));

  UnistylesRuntime.updateTheme("dark", (current) => ({
    ...current,
    typography,
  }));
}
