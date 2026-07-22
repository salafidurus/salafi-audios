/**
 * Canonical navigation metadata shared by web and native. Icons are referenced
 * by string name and resolved to components per-platform. `labelKey` is the i18n
 * key for the tab label (see @sd/core-i18n `getSubnavLabel`); `label` remains as
 * the English fallback.
 */
import { routes } from "./routes";

export type Section = "explore" | "library" | "settings" | "adminContents";

export type TabConfig = { id: string; label: string; labelKey: string; icon: string };

export const SECTION_TABS: Record<Section, TabConfig[]> = {
  explore: [
    {
      id: "popular",
      label: "Popular",
      labelKey: "navigation.subnav.explore.popular",
      icon: "flame",
    },
    { id: "recent", label: "Recent", labelKey: "navigation.subnav.explore.recent", icon: "clock" },
    {
      id: "following",
      label: "Following",
      labelKey: "navigation.subnav.explore.following",
      icon: "heart",
    },
  ],
  library: [
    {
      id: "started",
      label: "Started",
      labelKey: "navigation.subnav.library.started",
      icon: "play",
    },
    { id: "saved", label: "Saved", labelKey: "navigation.subnav.library.saved", icon: "bookmark" },
    {
      id: "completed",
      label: "Completed",
      labelKey: "navigation.subnav.library.completed",
      icon: "check-circle",
    },
  ],
  settings: [
    {
      id: "general",
      label: "General",
      labelKey: "navigation.subnav.settings.general",
      icon: "sliders-horizontal",
    },
    {
      id: "profile",
      label: "Profile",
      labelKey: "navigation.subnav.settings.profile",
      icon: "user",
    },
  ],
  adminContents: [
    {
      id: "topics",
      label: "Topics",
      labelKey: "navigation.subnav.admin.topics",
      icon: "folder",
    },
    {
      id: "listings",
      label: "Listings",
      labelKey: "navigation.subnav.admin.listings",
      icon: "list",
    },
  ],
};

export const DEFAULT_TABS: Record<Section, string> = {
  explore: "popular",
  library: "started",
  settings: "general",
  adminContents: "topics",
};

export const SECTION_LABELS: Record<Section, string> = {
  explore: "Explore",
  library: "Library",
  settings: "Settings",
  adminContents: "Content",
};

export const SECTION_ROUTES: Record<Section, string> = {
  explore: routes.explore.index,
  library: routes.library.index,
  settings: routes.settings.index,
  adminContents: routes.admin.contents,
};
