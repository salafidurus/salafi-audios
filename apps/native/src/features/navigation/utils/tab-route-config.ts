import { routes } from "@sd/core-contracts";

import { nativeRoutes } from "@/core/navigation/routes";

import { DEFAULT_TABS, SECTION_TABS, type Section } from "../types";

/** Describes the RootTab native contract and behavior. */
/** Describes the RootTab native type contract and behavior. */
export type RootTab = Section | "search";

/** Describes the isSection native contract and behavior. */
export function isSection(value: RootTab): value is Section {
  return value !== "search";
}

/** Describes the getRootTabFromPathname native contract and behavior. */
export function getRootTabFromPathname(pathname: string): RootTab {
  if (pathname.startsWith("/search")) return "search";
  return getSectionFromPathname(pathname);
}

function getSectionFromPathname(pathname: string): Section {
  if (isExplorePath(pathname)) return "explore";
  if (pathname.startsWith(nativeRoutes.myLibrary.index)) return "myLibrary";
  if (pathname.startsWith(routes.settings.index)) return "settings";
  return "explore";
}

function isExplorePath(pathname: string): boolean {
  return (
    pathname === "/" ||
    ["/scholar", "/curation", "/recent"].some((prefix) => pathname.startsWith(prefix))
  );
}

/** Describes the isTabRoute native contract and behavior. */
export function isTabRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    ["/recent", "/scholar", "/curation", "/search", "/my-library", "/settings"].some((prefix) =>
      pathname.startsWith(prefix),
    )
  );
}

/** Describes the getActiveSubsection native contract and behavior. */
export function getActiveSubsection(pathname: string, section: Section): string {
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const parts = normalizedPath.split("/").filter(Boolean);

  if (section === "explore") return getExploreSubsection(parts[0]);

  const candidate = parts[1];
  return SECTION_TABS[section].some((tab) => tab.id === candidate)
    ? candidate!
    : DEFAULT_TABS[section];
}

function getExploreSubsection(candidate: string | undefined): string {
  return candidate === "scholar" || candidate === "curation" || candidate === "recent"
    ? candidate
    : "recent";
}

/** Describes the buildSectionPath native contract and behavior. */
export function buildSectionPath(section: Section, tabId?: string): string {
  const activeTab = getActiveTab(section, tabId);
  if (section === "explore") return activeTab === "recent" ? "/" : `/${activeTab}`;
  if (section === "myLibrary") return buildLibraryPath(activeTab);
  return activeTab === DEFAULT_TABS[section] ? `/${section}` : `/${section}/${activeTab}`;
}

function getActiveTab(section: Section, tabId?: string): string {
  return tabId && SECTION_TABS[section].some((tab) => tab.id === tabId)
    ? tabId
    : DEFAULT_TABS[section];
}

function buildLibraryPath(activeTab: string): string {
  return activeTab === DEFAULT_TABS.myLibrary
    ? nativeRoutes.myLibrary.index
    : `/my-library/${activeTab}`;
}
