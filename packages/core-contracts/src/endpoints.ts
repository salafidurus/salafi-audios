export const endpoints = {
  search: {
    general: "/search",
    extended: "/search/extended",
  },
  topics: {
    list: "/topics",
  },
  scholars: {
    list: "/scholars",
    detail: (slug: string) => `/scholars/${slug}`,
    stats: (slug: string) => `/scholars/${slug}/stats`,
    content: (slug: string) => `/scholars/${slug}/content`,
  },
  collections: {
    detail: (id: string) => `/collections/${id}`,
  },
  series: {
    detail: (id: string) => `/series/${id}`,
  },
  lectures: {
    detail: (id: string) => `/lectures/${id}`,
  },
  feed: {
    recent: "/feed/recent",
    following: "/feed/following",
  },
  library: {
    saved: "/me/library/saved",
    completed: "/me/library/completed",
    progress: "/me/library/progress",
    saveLecture: (lectureId: string) => `/me/library/saved/${lectureId}`,
    syncSaved: "/me/library/saved/sync",
  },
  account: {
    profile: "/account/profile",
  },
  live: {
    active: "/live/active",
    upcoming: "/live/upcoming",
    scheduled: "/live/scheduled", // keep backward compat alias
    ended: "/live/ended",
  },
  progress: {
    get: (lectureId: string) => `/progress/${lectureId}`,
    update: (lectureId: string) => `/me/progress/${lectureId}`,
    history: "/progress/history",
    sync: "/me/progress/sync",
  },
} as const;
