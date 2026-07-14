import { DEFAULT_TABS, type Section } from "../types";
import { routes } from "@sd/core-contracts";

const PATH_TO_SECTION: Record<string, Section> = {
  [routes.explore.index]: "explore",
  [routes.live.index]: "live",
  [routes.library.index]: "library",
  [routes.settings.index]: "settings",
  [routes.admin.contents]: "adminContents",
  [routes.admin.live]: "adminLive",
};

export function getCurrentSection(pathname: string): Section | "home" {
  if (pathname === routes.admin.contents || pathname.startsWith(`${routes.admin.contents}/`)) {
    return "adminContents";
  }
  if (pathname === routes.admin.live || pathname.startsWith(`${routes.admin.live}/`)) {
    return "adminLive";
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

  if (parts[0] === "admin" && parts[1] === "contents") {
    return parts.length >= 3 ? (parts[2] ?? null) : null;
  }
  if (parts[0] === "admin" && parts[1] === "live") {
    return parts.length >= 3 ? (parts[2] ?? null) : null;
  }

  return parts.length >= 2 ? (parts[1] ?? null) : null;
}

export function buildSectionTabPath(section: Section, tabId?: string): string {
  const activeTab = tabId ?? DEFAULT_TABS[section];

  if (section === "adminContents") {
    if (activeTab === "topics") {
      return routes.admin.contents;
    }
    return `${routes.admin.contents}/${activeTab}`;
  }
  if (section === "adminLive") {
    if (activeTab === "sessions") {
      return routes.admin.live;
    }
    return `${routes.admin.live}/${activeTab}`;
  }

  // Standard handling for other sections
  if (activeTab === DEFAULT_TABS[section]) {
    return `/${section}`;
  }

  return `/${section}/${activeTab}`;
}
