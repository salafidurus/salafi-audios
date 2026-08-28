/** Stores browser locale preferences for server-rendered and hydrated layouts. */
/** Cookie key used to restore the locale selected by the user after hydration. */
export const LOCALE_COOKIE = "locale";

/** Persists a locale for one year with path-wide, same-site browser cookie semantics. */
export function setLocaleCookie(locale: string): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}
