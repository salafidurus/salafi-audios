import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

/** Configures native themes, breakpoints, and the Unistyles runtime. */
/** Enumerates the persisted theme choices supported by the native client. */
export type ThemePreference = "system" | "light" | "dark";
/** Enumerates the concrete themes that can be applied after system preference resolution. */
export type ResolvedTheme = "light" | "dark";

/** Identifies the AsyncStorage entry used to persist the native theme choice. */
export const THEME_PREFERENCE_KEY = "theme-preference:v1";

/** Transforms theme preference into the shape expected by native consumers. */
export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

/** Resolves an explicit theme choice or maps the system color scheme to a concrete theme. */
export function resolveThemePreference(
  preference: ThemePreference,
  colorScheme: "light" | "dark" | "unspecified" | null | undefined,
): ResolvedTheme {
  if (preference === "system") return colorScheme === "dark" ? "dark" : "light";
  return preference;
}

/** Loads and validates the persisted theme choice, defaulting safely to system mode. */
export async function getStoredThemePreference(): Promise<ThemePreference> {
  return parseThemePreference(await AsyncStorage.getItem(THEME_PREFERENCE_KEY));
}

/** Persists the selected theme choice for subsequent native launches. */
export async function setStoredThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}

/** Applies the resolved preference to the Unistyles runtime and returns the applied theme. */
export function applyThemePreference(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveThemePreference(preference, Appearance.getColorScheme());
  if (preference === "system") {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(resolved);
  }
  return resolved;
}

/** Subscribes to OS appearance changes and returns an unsubscribe callback. */
export function subscribeToSystemTheme(onChange: () => void): () => void {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}
