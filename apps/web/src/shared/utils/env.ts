import { getWebPublicEnv, type WebPublicEnv } from "@sd/env";

let cached: WebPublicEnv | null = null;

/**
 * Web environment (client-safe).
 * Lazy so CI builds can compile without NEXT_PUBLIC_* values.
 */
export function getWebEnv(): WebPublicEnv {
  cached ??= getWebPublicEnv();
  return cached;
}

export function tryGetWebEnv(): WebPublicEnv | null {
  try {
    return getWebEnv();
  } catch {
    return null;
  }
}
