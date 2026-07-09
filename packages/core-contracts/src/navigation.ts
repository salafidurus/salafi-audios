/**
 * Canonical navigation metadata shared by web and native. Icons are referenced
 * by string name and resolved to components per-platform. `labelKey` is the i18n
 * key for the tab label (see @sd/core-i18n `getSubnavLabel`); `label` remains as
 * the English fallback.
 */
import { routes } from "./routes";

export type Section = "explore" | "live" | "library" | "settings" | "admin";

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
  live: [
    { id: "ongoing", label: "Live Now", labelKey: "navigation.subnav.live.ongoing", icon: "radio" },
    {
      id: "scheduled",
      label: "Scheduled",
      labelKey: "navigation.subnav.live.scheduled",
      icon: "calendar",
    },
    {
      id: "ended",
      label: "Ended",
      labelKey: "navigation.subnav.live.ended",
      icon: "check-circle",
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
    { id: "legal", label: "Legal", labelKey: "navigation.subnav.settings.legal", icon: "scale" },
  ],
  admin: [
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
  live: "ongoing",
  library: "started",
  settings: "general",
  admin: "topics",
};

export const SECTION_LABELS: Record<Section, string> = {
  explore: "Explore",
  live: "Live",
  library: "Library",
  settings: "Settings",
  admin: "Admin",
};

export const SECTION_ROUTES: Record<Section, string> = {
  explore: routes.explore.index,
  live: routes.live.index,
  library: routes.library.index,
  settings: routes.settings.index,
  admin: routes.admin.contents,
};
