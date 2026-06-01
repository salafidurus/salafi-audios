import { BookOpen, Cloud, Mic, Search, Settings } from "lucide-react-native";
import type { ComponentType } from "react";
import { routes } from "@sd/core-contracts";
import { DEFAULT_TABS, SECTION_TABS, type Section } from "../types";

export type RootTab = Section | "search";

export type RootTabConfig = {
  id: RootTab;
  routeName: "feed" | "live" | "(search)" | "library" | "account";
  label: string;
  Icon: ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
};

export const ROOT_TABS: RootTabConfig[] = [
  { id: "feed", routeName: "feed", label: "Feed", Icon: Cloud },
  { id: "live", routeName: "live", label: "Live", Icon: Mic },
  { id: "search", routeName: "(search)", label: "Search", Icon: Search },
  { id: "library", routeName: "library", label: "Library", Icon: BookOpen },
  { id: "account", routeName: "account", label: "Account", Icon: Settings },
];

const GROUP_NAME_TO_TAB: Record<RootTabConfig["routeName"], RootTab> = {
  feed: "feed",
  live: "live",
  "(search)": "search",
  library: "library",
  account: "account",
};

export function getRootTabByRouteName(routeName: string): RootTabConfig | undefined {
  const tabId = GROUP_NAME_TO_TAB[routeName as RootTabConfig["routeName"]];
  return ROOT_TABS.find((tab) => tab.id === tabId);
}

export function getRootTabFromPathname(pathname: string): RootTab {
  if (pathname === routes.home || pathname.startsWith(routes.search)) {
    return "search";
  }

  if (pathname.startsWith(routes.feed.index)) {
    return "feed";
  }

  if (pathname.startsWith(routes.live.index)) {
    return "live";
  }

  if (pathname.startsWith(routes.library.index)) {
    return "library";
  }

  if (pathname.startsWith(routes.account.index)) {
    return "account";
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
