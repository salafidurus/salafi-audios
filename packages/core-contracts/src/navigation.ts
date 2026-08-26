/**
 * Canonical navigation metadata shared by web and native. Icons are referenced
 * by string name and resolved to components per-platform. `labelKey` is the i18n
 * key for the tab label (see @sd/core-i18n `getSubnavLabel`); `label` remains as
 * the English fallback.
 */
import { routes } from "./routes";

export type Section = "explore" | "myLibrary" | "settings" | "adminContents";

export type TabConfig = { id: string; label: string; labelKey: string; icon: string };

export const SECTION_TABS = {
  explore: [
    { id: "recent", label: "Recent", labelKey: "navigation.subnav.explore.recent", icon: "clock" },
    {
      id: "scholar",
      label: "Scholars",
      labelKey: "navigation.subnav.explore.scholar",
      icon: "graduation-cap",
    },
    {
      id: "curation",
      label: "Curation",
      labelKey: "navigation.subnav.explore.curation",
      icon: "sparkles",
    },
  ],
  myLibrary: [
    {
      id: "started",
      label: "Started",
      labelKey: "navigation.subnav.myLibrary.started",
      icon: "play",
    },
    {
      id: "saved",
      label: "Saved",
      labelKey: "navigation.subnav.myLibrary.saved",
      icon: "bookmark",
    },
    {
      id: "completed",
      label: "Completed",
      labelKey: "navigation.subnav.myLibrary.completed",
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
} satisfies Record<Section, TabConfig[]>;

export const DEFAULT_TABS = {
  explore: "recent",
  myLibrary: "started",
  settings: "general",
  adminContents: "topics",
} satisfies Record<Section, string>;

export const SECTION_LABELS = {
  explore: "Explore",
  myLibrary: "My Library",
  settings: "Settings",
  adminContents: "Content",
} satisfies Record<Section, string>;

export const SECTION_ROUTES = {
  explore: routes.explore.index,
  myLibrary: routes.myLibrary.index,
  settings: routes.settings.index,
  adminContents: routes.admin.contents,
} satisfies Record<Section, string>;
