export type ThemePreference = "system" | "light" | "dark";

export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "theme-preference:v1";

/**
 * Returns the tiny browser script used before hydration so the first paint
 * uses the same preference resolution as the mounted ThemeSync component.
 */
export function getThemeBootstrapScript(): string {
  return `!function(){try{var p=window.localStorage.getItem(${JSON.stringify(THEME_KEY)}),d=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light"),document.documentElement.classList.toggle("dark",d)}catch(_){}}()`;
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  return preference === "system" ? (prefersDark ? "dark" : "light") : preference;
}
