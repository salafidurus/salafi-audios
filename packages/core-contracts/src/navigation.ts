/**
 * Canonical navigation metadata shared by web and native. Icons are referenced
 * by string name and resolved to components per-platform. `labelKey` is the i18n
 * key for the tab label (see @sd/core-i18n `getSubnavLabel`); `label` remains as
 * the English fallback.
 */
import { routes } from "./routes";

export type Section = "feed" | "live" | "library" | "account";

export type TabConfig = { id: string; label: string; labelKey: string; icon: string };

export const SECTION_TABS: Record<Section, TabConfig[]> = {
  feed: [
    { id: "popular", label: "Popular", labelKey: "navigation.subnav.feed.popular", icon: "flame" },
    { id: "recent", label: "Recent", labelKey: "navigation.subnav.feed.recent", icon: "clock" },
    {
      id: "following",
      label: "Following",
      labelKey: "navigation.subnav.feed.following",
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
  account: [
    {
      id: "general",
      label: "General",
      labelKey: "navigation.subnav.account.general",
      icon: "sliders-horizontal",
    },
    {
      id: "profile",
      label: "Profile",
      labelKey: "navigation.subnav.account.profile",
      icon: "user",
    },
    { id: "legal", label: "Legal", labelKey: "navigation.subnav.account.legal", icon: "scale" },
  ],
};

export const DEFAULT_TABS: Record<Section, string> = {
  feed: "popular",
  live: "ongoing",
  library: "started",
  account: "general",
};

export const SECTION_LABELS: Record<Section, string> = {
  feed: "Feed",
  live: "Live",
  library: "Library",
  account: "Account",
};

export const SECTION_ROUTES: Record<Section, string> = {
  feed: routes.feed.index,
  live: routes.live.index,
  library: routes.library.index,
  account: routes.account.index,
};
