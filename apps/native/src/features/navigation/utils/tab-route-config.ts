import { routes } from "@sd/core-contracts";

/** Defines the native root-tab contract used for route ownership and accessory visibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the finite union contract is documented above.
export type RootTab = "home" | "explore" | "scholars" | "myLibrary" | "settings";

/** Maps a canonical native pathname to its owning persistent root destination. */
export function getRootTabFromPathname(pathname: string): RootTab | null {
  if (pathname === routes.home) return "home";
  if (pathname === routes.explore.index) return "explore";
  if (pathname === routes.scholars.index) return "scholars";
  if (pathname === routes.myLibrary.index) return "myLibrary";
  if (pathname === routes.settings.index) return "settings";
  return null;
}

/** Returns whether a pathname belongs to one of the five persistent native roots. */
export function isTabRoute(pathname: string): boolean {
  return getRootTabFromPathname(pathname) !== null;
}
