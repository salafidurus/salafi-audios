import type { ComponentType } from "react";

import { routes } from "@sd/core-contracts";
import { BookOpen, Cloud, Search, Settings } from "lucide-react-native";

import { nativeRoutes } from "@/core/navigation/routes";

import { DEFAULT_TABS, SECTION_TABS, type Section } from "../types";

export type RootTab = Section | "search";

export type RootTabConfig = {
  id: RootTab;
  routeName: "explore" | "(search)" | "my-library" | "settings";
  /** English fallback label. */
  label: string;
  /** i18n key (under the `tabs` namespace) resolved at render time. */
  labelKey: string;
  Icon: ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
};

export const ROOT_TABS: RootTabConfig[] = [
  { id: "explore", routeName: "explore", label: "Explore", labelKey: "tabs.explore", Icon: Cloud },
  { id: "search", routeName: "(search)", label: "Search", labelKey: "tabs.search", Icon: Search },
  {
    id: "myLibrary",
    routeName: "my-library",
    label: "My Library",
    labelKey: "tabs.myLibrary",
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

const GROUP_NAME_TO_TAB = {
  explore: "explore",
  "(search)": "search",
  "my-library": "myLibrary",
  settings: "settings",
} satisfies Record<RootTabConfig["routeName"], RootTab>;

export function isSection(value: RootTab): value is Section {
  return value !== "search";
}

function isRootTabRouteName(routeName: string): routeName is keyof typeof GROUP_NAME_TO_TAB {
  return routeName in GROUP_NAME_TO_TAB;
}

export function getRootTabByRouteName(routeName: string): RootTabConfig | undefined {
  if (!isRootTabRouteName(routeName)) {
    return undefined;
  }

  const tabId = GROUP_NAME_TO_TAB[routeName];
  return ROOT_TABS.find((tab) => tab.id === tabId);
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
