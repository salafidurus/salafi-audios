// Web session bearer token store.
//
// The web app and API are deployed on different sites in production, so the
// session cannot ride on a cookie (browsers block cross-site cookies). Instead
// the session token is held here and sent as `Authorization: Bearer` on every
// API request. localStorage persists it across reloads/tabs; it is JS-readable,
// so the app must ship a strict Content-Security-Policy to bound XSS exposure.

const TOKEN_KEY = "sd.bearer_token";

export function getBearerToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setBearerToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable (private mode, quota) — auth degrades, never crashes
  }
}

export function clearBearerToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}
