import { BookOpen, Cloud, Mic, Search, Settings } from "lucide-react-native";
import type { ComponentType } from "react";
import { routes } from "@sd/core-contracts";
import { DEFAULT_TABS, SECTION_TABS, type Section } from "../types";

export type RootTab = Section | "search";

export type RootTabConfig = {
  id: RootTab;
  routeName: "explore" | "live" | "(search)" | "library" | "settings";
  /** English fallback label. */
  label: string;
  /** i18n key (under the `tabs` namespace) resolved at render time. */
  labelKey: string;
  Icon: ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
};

export const ROOT_TABS: RootTabConfig[] = [
  { id: "explore", routeName: "explore", label: "Explore", labelKey: "tabs.explore", Icon: Cloud },
  { id: "live", routeName: "live", label: "Live", labelKey: "tabs.live", Icon: Mic },
  { id: "search", routeName: "(search)", label: "Search", labelKey: "tabs.search", Icon: Search },
  {
    id: "library",
    routeName: "library",
    label: "Library",
    labelKey: "tabs.library",
    Icon: BookOpen,
  },
  {
    id: "settings",
    routeName: "settings",
    label: "Settings",
    labelKey: "tabs.settings",
    Icon: Settings,
  },
];

const GROUP_NAME_TO_TAB: Record<RootTabConfig["routeName"], RootTab> = {
  explore: "explore",
  live: "live",
  "(search)": "search",
  library: "library",
  settings: "settings",
};

export function getRootTabByRouteName(routeName: string): RootTabConfig | undefined {
  const tabId = GROUP_NAME_TO_TAB[routeName as RootTabConfig["routeName"]];
  return ROOT_TABS.find((tab) => tab.id === tabId);
}

export function getRootTabFromPathname(pathname: string): RootTab {
  if (pathname === routes.home || pathname.startsWith(routes.search)) {
    return "search";
  }

  if (pathname.startsWith(routes.explore.index)) {
    return "explore";
  }

  if (pathname.startsWith(routes.live.index)) {
    return "live";
  }

  if (pathname.startsWith(routes.library.index)) {
    return "library";
  }

  if (pathname.startsWith(routes.settings.index)) {
    return "settings";
  }

  return "search";
}

export function getActiveSubsection(pathname: string, section: Section): string {
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const parts = normalizedPath.split("/").filter(Boolean);
  const candidate = parts[1];

  return SECTION_TABS[section].some((tab) => tab.id === candidate)
    ? candidate!
    : DEFAULT_TABS[section];
}

export function buildSectionPath(section: Section, tabId?: string): string {
  const activeTab =
    tabId && SECTION_TABS[section].some((tab) => tab.id === tabId) ? tabId : DEFAULT_TABS[section];

  if (activeTab === DEFAULT_TABS[section]) {
    return `/${section}`;
  }

  return `/${section}/${activeTab}`;
}
