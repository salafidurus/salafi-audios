import { routes } from "@sd/core-contracts";

import { hasWindow } from "@/shared/lib/runtime-guards";

/** Stores and restores safe public destinations around admin navigation. */
/** Session-storage key used to return from admin workspace to the public app. */
export const ADMIN_RETURN_PATH_KEY = "sd:admin-return-path:v1";

/** Minimal storage contract used by admin return-path helpers and tests. */
export type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** Returns whether a path is public and safe to store as an admin return target. */
export function isSafePublicPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    path !== routes.admin.index &&
    !path.startsWith(`${routes.admin.index}/`)
  );
}

/** Stores a safe public path when session storage is available. */
export function rememberAdminReturnPath(path: string, storage?: StorageLike): void {
  if (!isSafePublicPath(path)) return;
  try {
    storage?.setItem(ADMIN_RETURN_PATH_KEY, path);
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

/** Reads the stored public return path, falling back home for invalid values. */
export function getAdminReturnPath(storage?: StorageLike): string {
  try {
    const path = storage?.getItem(ADMIN_RETURN_PATH_KEY);
    return path && isSafePublicPath(path) ? path : routes.home;
  } catch {
    return routes.home;
  }
}

/** Returns session storage when the browser exposes it, otherwise undefined. */
export function getBrowserStorage(): StorageLike | undefined {
  if (!hasWindow()) return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}
