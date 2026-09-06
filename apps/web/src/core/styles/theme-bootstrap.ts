/**
 * Allowed persisted values for the web theme selector.
 *
 * `system` resolves from the browser's `prefers-color-scheme` media query;
 * `light` and `dark` explicitly override that preference. Theme readers treat
 * unknown storage values as `system` so a stale value cannot break first paint.
 */
export type ThemePreference = "system" | "light" | "dark";

/** Concrete theme values applied to the document after resolving a preference. */
export type ResolvedTheme = "light" | "dark";

/** Versioned local-storage key shared by the inline bootstrap and mounted theme sync. */
export const THEME_KEY = "theme-preference:v1";

const INLINE_SCRIPT_ESCAPE_MAP = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
} satisfies Record<string, string>;

/** Escapes characters that could terminate or alter the serialized inline bootstrap script. */
export function escapeUnsafeForInlineScript(value: string): string {
  return value.replace(/[<>/\\\b\f\n\r\t\0\u2028\u2029]/g, (character) => {
    // SAFETY: this callback only receives characters matched by the escape regex above.
    const escaped = INLINE_SCRIPT_ESCAPE_MAP[character as keyof typeof INLINE_SCRIPT_ESCAPE_MAP];
    return escaped ?? character;
  });
}

/**
 * Returns the tiny browser script used before hydration so the first paint
 * uses the same preference resolution as the mounted ThemeSync component.
 */
export function getThemeBootstrapScript(): string {
  const serializedThemeKey = escapeUnsafeForInlineScript(JSON.stringify(THEME_KEY));
  return `!function(){try{var p=window.localStorage.getItem(${serializedThemeKey}),d=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light"),document.documentElement.classList.toggle("dark",d)}catch(_){}}()`;
}

/** Resolves an explicit preference or system preference into a concrete document theme. */
export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  return preference === "system" ? (prefersDark ? "dark" : "light") : preference;
}
