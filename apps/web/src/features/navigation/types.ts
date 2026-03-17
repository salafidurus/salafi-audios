export type Section = "feed" | "live" | "library" | "account";

export type TabConfig = { id: string; label: string; icon: string };

export const SECTION_TABS: Record<Section, TabConfig[]> = {
  feed: [
    { id: "popular", label: "Popular", icon: "flame" },
    { id: "recent", label: "Recent", icon: "clock" },
    { id: "following", label: "Following", icon: "heart" },
  ],
  live: [
    { id: "scheduled", label: "Scheduled", icon: "calendar" },
    { id: "ongoing", label: "Ongoing", icon: "radio" },
    { id: "ended", label: "Ended", icon: "circle-check" },
  ],
  library: [
    { id: "saved", label: "Saved", icon: "bookmark" },
    { id: "started", label: "Started", icon: "play" },
    { id: "completed", label: "Completed", icon: "check-circle" },
  ],
  account: [
    { id: "profile", label: "Profile", icon: "user" },
    { id: "general", label: "General", icon: "sliders-horizontal" },
    { id: "legal", label: "Legal", icon: "scale" },
  ],
};

export const DEFAULT_TABS: Record<Section, string> = {
  feed: "popular",
  live: "scheduled",
  library: "saved",
  account: "profile",
};

export const SECTION_LABELS: Record<Section, string> = {
  feed: "Feeds",
  live: "Live",
  library: "Lessons",
  account: "Account",
};

export const SECTION_ROUTES: Record<Section, string> = {
  feed: "/feed",
  live: "/live",
  library: "/library",
  account: "/account",
};
