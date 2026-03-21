import { DEFAULT_TABS, SECTION_TABS, type Section } from "../types";
import type { ActiveNavigationState } from "../types";

const INTERNAL_ROUTE_PREFIX = "/(shell)";
const ROUTE_GROUP_TO_PATH_SEGMENT: Record<string, string | null> = {
  "(shell)": null,
  "(search)": "search",
  "(feed)": "feed",
  "(live)": "live",
  "(library)": "library",
  "(account)": "account",
};

const SECTION_PATH_TO_ID: Record<string, Section> = {
  feed: "feed",
  live: "live",
  library: "library",
  account: "account",
};

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function normalizeShellPathname(pathname: string): string {
  const parts = normalizePathname(pathname).split("/").filter(Boolean);

  if (parts.length === 0) {
    return "/";
  }

  const normalizedParts = parts.flatMap((part) => {
    if (part in ROUTE_GROUP_TO_PATH_SEGMENT) {
      const mapped = ROUTE_GROUP_TO_PATH_SEGMENT[part];
      return mapped ? [mapped] : [];
    }

    return [part];
  });

  return normalizedParts.length === 0 ? "/" : `/${normalizedParts.join("/")}`;
}

function getPathParts(pathname: string): string[] {
  return normalizeShellPathname(pathname).split("/").filter(Boolean);
}

function isSection(value: string | undefined): value is Section {
  return Boolean(value && value in SECTION_PATH_TO_ID);
}

function isKnownTab(section: Section, tabId: string | undefined | null): tabId is string {
  if (!tabId) {
    return false;
  }

  return SECTION_TABS[section].some((tab) => tab.id === tabId);
}

export function getCurrentSection(pathname: string): Section | "home" {
  const [sectionPath] = getPathParts(pathname);

  if (!isSection(sectionPath)) {
    return "home";
  }

  return SECTION_PATH_TO_ID[sectionPath];
}

export function getActiveTabFromPath(pathname: string): string | null {
  const [sectionPath, tabId] = getPathParts(pathname);

  if (!isSection(sectionPath) || !isKnownTab(SECTION_PATH_TO_ID[sectionPath], tabId)) {
    return null;
  }

  return tabId;
}

export function buildSectionHref(section: Section, preferredTab?: string | null): string {
  const resolvedTab = isKnownTab(section, preferredTab) ? preferredTab : DEFAULT_TABS[section];
  return `${INTERNAL_ROUTE_PREFIX}/(${section})/${resolvedTab}`;
}

export function buildSearchHomeHref(): string {
  return `${INTERNAL_ROUTE_PREFIX}/(search)/`;
}

export function getActiveNavigationState(
  pathname: string,
  rememberedTabs: Record<Section, string>,
): ActiveNavigationState {
  const activeSection = getCurrentSection(pathname);
  const activeSubsection =
    activeSection === "home" ? null : getActiveTabFromPath(pathname) ?? null;

  if (activeSection === "home") {
    return {
      pathname: normalizeShellPathname(pathname),
      activeSection: null,
      activeSubsection: null,
      activeTab: null,
      shellMode: "launcher",
      showSectionLauncher: true,
      showSectionSwitcher: false,
      showSearchShortcut: false,
      canOpenSectionSwitcher: false,
    };
  }

  return {
    pathname: normalizeShellPathname(pathname),
    activeSection,
    activeSubsection,
    activeTab: activeSubsection ?? rememberedTabs[activeSection] ?? DEFAULT_TABS[activeSection],
    shellMode: "section",
    showSectionLauncher: false,
    showSectionSwitcher: true,
    showSearchShortcut: true,
    canOpenSectionSwitcher: true,
  };
}
