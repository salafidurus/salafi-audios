import { routes } from "@sd/core-contracts";

import { hasWindow } from "@/shared/lib/runtime-guards";

export const ADMIN_RETURN_PATH_KEY = "sd:admin-return-path:v1";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function isSafePublicPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    path !== routes.admin.index &&
    !path.startsWith(`${routes.admin.index}/`)
  );
}

export function rememberAdminReturnPath(path: string, storage?: StorageLike): void {
  if (!isSafePublicPath(path)) return;
  try {
    storage?.setItem(ADMIN_RETURN_PATH_KEY, path);
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function getAdminReturnPath(storage?: StorageLike): string {
  try {
    const path = storage?.getItem(ADMIN_RETURN_PATH_KEY);
    return path && isSafePublicPath(path) ? path : routes.home;
  } catch {
    return routes.home;
  }
}

export function getBrowserStorage(): StorageLike | undefined {
  if (!hasWindow()) return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}
