import { routes } from "@sd/core-contracts";

import { nativeRoutes } from "@/core/navigation/routes";

import { DEFAULT_TABS, SECTION_TABS, type Section } from "../types";

export type RootTab = Section | "search";

export function isSection(value: RootTab): value is Section {
  return value !== "search";
}

export function getRootTabFromPathname(pathname: string): RootTab {
  if (pathname.startsWith("/search")) {
    return "search";
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/scholar") ||
    pathname.startsWith("/curation") ||
    pathname.startsWith("/recent")
  ) {
    return "explore";
  }

  if (pathname.startsWith(nativeRoutes.myLibrary.index)) {
    return "myLibrary";
  }

  if (pathname.startsWith(routes.settings.index)) {
    return "settings";
  }

  return "explore";
}

export function isTabRoute(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/recent" ||
    pathname === "/scholar" ||
    pathname === "/curation" ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/my-library") ||
    pathname.startsWith("/settings")
  ) {
    return true;
  }
  return false;
}

export function getActiveSubsection(pathname: string, section: Section): string {
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const parts = normalizedPath.split("/").filter(Boolean);

  if (section === "explore") {
    const candidate = parts[0] || "recent";
    if (candidate === "scholar" || candidate === "curation" || candidate === "recent") {
      return candidate;
    }
    return "recent";
  }

  const candidate = parts[1];
  return SECTION_TABS[section].some((tab) => tab.id === candidate)
    ? candidate!
    : DEFAULT_TABS[section];
}

export function buildSectionPath(section: Section, tabId?: string): string {
  const activeTab =
    tabId && SECTION_TABS[section].some((tab) => tab.id === tabId) ? tabId : DEFAULT_TABS[section];

  if (section === "explore") {
    if (activeTab === "recent") {
      return "/";
    }
    return `/${activeTab}`;
  }

  if (section === "myLibrary") {
    if (activeTab === DEFAULT_TABS[section]) {
      return nativeRoutes.myLibrary.index;
    }
    return `/my-library/${activeTab}`;
  }

  if (activeTab === DEFAULT_TABS[section]) {
    return `/${section}`;
  }

  return `/${section}/${activeTab}`;
}
