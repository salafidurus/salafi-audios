import { DEFAULT_TABS, type Section } from "../types";
import { routes } from "@sd/core-contracts";

const PATH_TO_SECTION: Record<string, Section> = {
  [routes.feed.root]: "feed",
  [routes.live.root]: "live",
  [routes.library.root]: "library",
  [routes.account.root]: "account",
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
  // e.g. /feed/recent → ["feed", "recent"]
  return parts.length >= 2 ? parts[1] : null;
}

export function buildSectionTabPath(section: Section, tabId?: string): string {
  const activeTab = tabId ?? DEFAULT_TABS[section];

  if (activeTab === DEFAULT_TABS[section]) {
    return `/${section}`;
  }

  return `/${section}/${activeTab}`;
}
