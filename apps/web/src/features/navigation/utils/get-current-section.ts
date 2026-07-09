import { DEFAULT_TABS, type Section } from "../types";
import { routes } from "@sd/core-contracts";

const PATH_TO_SECTION: Record<string, Section> = {
  [routes.explore.index]: "explore",
  [routes.live.index]: "live",
  [routes.library.index]: "library",
  [routes.settings.index]: "settings",
  [routes.admin.contents]: "admin",
};

export function getCurrentSection(pathname: string): Section | "home" {
  // Special handling for admin - only recognize /admin/contents paths
  if (pathname === routes.admin.contents || pathname.startsWith(`${routes.admin.contents}/`)) {
    return "admin";
  }

  for (const [path, section] of Object.entries(PATH_TO_SECTION)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return section;
    }
  }
  return "home";
}

export function getActiveTabFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);

  // Special handling for admin section: /admin/contents/listings → "listings"
  if (parts[0] === "admin" && parts[1] === "contents") {
    return parts.length >= 3 ? (parts[2] ?? null) : null;
  }

  // Standard handling: /section/tab → ["section", "tab"]
  return parts.length >= 2 ? (parts[1] ?? null) : null;
}

export function buildSectionTabPath(section: Section, tabId?: string): string {
  const activeTab = tabId ?? DEFAULT_TABS[section];

  // Special handling for admin section
  if (section === "admin") {
    if (activeTab === "topics") {
      return routes.admin.contents;
    }
    return `${routes.admin.contents}/${activeTab}`;
  }

  // Standard handling for other sections
  if (activeTab === DEFAULT_TABS[section]) {
    return `/${section}`;
  }

  return `/${section}/${activeTab}`;
}
