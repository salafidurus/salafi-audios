import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFERENCE_KEY = "theme-preference:v1";

export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function resolveThemePreference(
  preference: ThemePreference,
  colorScheme: "light" | "dark" | "unspecified" | null | undefined,
): ResolvedTheme {
  if (preference === "system") return colorScheme === "dark" ? "dark" : "light";
  return preference;
}

export async function getStoredThemePreference(): Promise<ThemePreference> {
  return parseThemePreference(await AsyncStorage.getItem(THEME_PREFERENCE_KEY));
}

export async function setStoredThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}

export function applyThemePreference(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveThemePreference(preference, Appearance.getColorScheme());
  UnistylesRuntime.setTheme(resolved);
  return resolved;
}

export function subscribeToSystemTheme(onChange: () => void): () => void {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}
