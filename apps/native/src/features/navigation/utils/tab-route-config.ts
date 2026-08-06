import type { ComponentType } from "react";

import { BookOpen, Cloud, Home, Search, Settings } from "lucide-react-native";

import { DEFAULT_TABS, SECTION_TABS, type Section } from "../types";

export type RootTab = Section | "home" | "search";

export type RootTabConfig = {
  id: RootTab;
  routeName: "(home)" | "explore" | "(search)" | "library" | "settings";
  /** English fallback label. */
  label: string;
  /** i18n key (under the `navigation` namespace) resolved at render time. */
  labelKey: string;
  Icon: ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
};

export const ROOT_TABS: RootTabConfig[] = [
  {
    id: "home",
    routeName: "(home)",
    label: "Home",
    labelKey: "navigation.home",
    Icon: Home,
  },
  {
    id: "explore",
    routeName: "explore",
    label: "Explore",
    labelKey: "navigation.explore",
    Icon: Cloud,
  },
  {
    id: "search",
    routeName: "(search)",
    label: "Search",
    labelKey: "navigation.search",
    Icon: Search,
  },
  {
    id: "library",
    routeName: "library",
    label: "Library",
    labelKey: "navigation.library",
    Icon: BookOpen,
  },
  {
    id: "settings",
    routeName: "settings",
    label: "Settings",
    labelKey: "navigation.settings",
    Icon: Settings,
  },
];

const GROUP_NAME_TO_TAB: Record<RootTabConfig["routeName"], RootTab> = {
  "(home)": "home",
  explore: "explore",
  "(search)": "search",
  library: "library",
  settings: "settings",
};

export function getRootTabByRouteName(routeName: string): RootTabConfig | undefined {
  const tabId = GROUP_NAME_TO_TAB[routeName as RootTabConfig["routeName"]];
  return ROOT_TABS.find((tab) => tab.id === tabId);
}

export function getRootTabFromPathname(pathname: string): RootTab {
  const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  if (normalized === "/search" || normalized.startsWith("/search/")) {
    return "search";
  }

  if (normalized === "/") {
    return "home";
  }

  if (normalized === "/explore" || normalized.startsWith("/explore/")) {
    return "explore";
  }

  // Legacy bare sub-routes redirect into the explore section.
  if (
    normalized === "/recent" ||
    normalized.startsWith("/recent/") ||
    normalized === "/scholar" ||
    normalized.startsWith("/scholar/") ||
    normalized === "/curation" ||
    normalized.startsWith("/curation/")
  ) {
    return "explore";
  }

  if (normalized === "/library" || normalized.startsWith("/library/")) {
    return "library";
  }

  if (normalized === "/settings" || normalized.startsWith("/settings/")) {
    return "settings";
  }

  return "home";
}

export function isTabRoute(pathname: string): boolean {
  const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  if (
    normalized === "/" ||
    normalized === "/explore" ||
    normalized.startsWith("/explore/") ||
    normalized.startsWith("/search") ||
    normalized.startsWith("/library") ||
    normalized.startsWith("/settings")
  ) {
    return true;
  }
  return false;
}

export function getActiveSubsection(pathname: string, section: Section | "home"): string {
  if (section === "home") {
    return "home";
  }

  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const parts = normalizedPath.split("/").filter(Boolean);

  if (section === "explore") {
    // /explore            -> parts = ["explore"]
    // /explore/recent     -> parts = ["explore","recent"]
    const candidate = parts[1] ?? "recent";
    if (
      candidate === "recent" ||
      candidate === "scholar" ||
      candidate === "curation" ||
      candidate === "all"
    ) {
      return candidate;
    }
    return "recent";
  }

  const candidate = parts[1];
  return SECTION_TABS[section].some((tab) => tab.id === candidate)
    ? candidate!
    : DEFAULT_TABS[section];
}

export function buildSectionPath(section: Section | "home", tabId?: string): string {
  if (section === "home") {
    return "/";
  }

  const activeTab =
    tabId && SECTION_TABS[section].some((tab) => tab.id === tabId) ? tabId : DEFAULT_TABS[section];

  if (section === "explore") {
    if (activeTab === "recent") {
      return "/explore/recent";
    }
    return `/explore/${activeTab}`;
  }

  if (activeTab === DEFAULT_TABS[section]) {
    return `/${section}`;
  }

  return `/${section}/${activeTab}`;
}
