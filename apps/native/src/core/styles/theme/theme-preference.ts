import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

/** Provides the native core styles theme theme-preference module responsibility. */
/** Describes the ThemePreference native type contract and behavior. */
export type ThemePreference = "system" | "light" | "dark";
/** Describes the ResolvedTheme native type contract and behavior. */
export type ResolvedTheme = "light" | "dark";

/** Describes the const THEME_PREFERENCE_KEY = "theme-preference:v1"; native declaration contract and behavior. */
export const THEME_PREFERENCE_KEY = "theme-preference:v1";

/** Describes the parseThemePreference native function contract and behavior. */
export function parseThemePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

/** Describes the resolveThemePreference native function contract and behavior. */
export function resolveThemePreference(
  preference: ThemePreference,
  colorScheme: "light" | "dark" | "unspecified" | null | undefined,
): ResolvedTheme {
  if (preference === "system") return colorScheme === "dark" ? "dark" : "light";
  return preference;
}

/** Describes the getStoredThemePreference native function contract and behavior. */
export async function getStoredThemePreference(): Promise<ThemePreference> {
  return parseThemePreference(await AsyncStorage.getItem(THEME_PREFERENCE_KEY));
}

/** Describes the setStoredThemePreference native function contract and behavior. */
export async function setStoredThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
}

/** Describes the applyThemePreference native function contract and behavior. */
export function applyThemePreference(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveThemePreference(preference, Appearance.getColorScheme());
  UnistylesRuntime.setTheme(resolved);
  return resolved;
}

/** Describes the subscribeToSystemTheme native function contract and behavior. */
export function subscribeToSystemTheme(onChange: () => void): () => void {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}
