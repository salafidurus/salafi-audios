import type { Section } from "../types";

const PATH_TO_SECTION: Record<string, Section> = {
  "/feed": "feed",
  "/live": "live",
  "/library": "library",
  "/account": "account",
};

export function getCurrentSection(pathname: string): Section | "home" {
  for (const [path, section] of Object.entries(PATH_TO_SECTION)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return section;
    }
  }
  return "home";
}

export function getActiveTabFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  // e.g. /feed/popular → ["feed", "popular"]
  return parts.length >= 2 ? parts[1] : null;
}
