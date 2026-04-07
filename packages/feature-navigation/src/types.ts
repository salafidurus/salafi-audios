export type Section = "feed" | "live" | "library" | "account";

export type TabConfig = { id: string; label: string; icon: string };

export const SECTION_TABS: Record<Section, TabConfig[]> = {
  feed: [
    { id: "popular", label: "Popular", icon: "flame" },
    { id: "recent", label: "Recent", icon: "clock" },
    { id: "following", label: "Following", icon: "heart" },
  ],
  live: [
    { id: "ongoing", label: "Ongoing", icon: "radio" },
    { id: "scheduled", label: "Scheduled", icon: "calendar" },
    { id: "ended", label: "Ended", icon: "circle-check" },
  ],
  library: [
    { id: "started", label: "Started", icon: "play" },
    { id: "saved", label: "Saved", icon: "bookmark" },
    { id: "completed", label: "Completed", icon: "check-circle" },
  ],
  account: [
    { id: "general", label: "General", icon: "sliders-horizontal" },
    { id: "profile", label: "Profile", icon: "user" },
    { id: "legal", label: "Legal", icon: "scale" },
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

import { routes } from "@sd/core-contracts";

export const SECTION_ROUTES: Record<Section, string> = {
  feed: routes.feed.root,
  live: routes.live.root,
  library: routes.library.root,
  account: routes.account.root,
};
