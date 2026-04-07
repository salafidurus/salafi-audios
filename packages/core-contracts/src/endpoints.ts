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
    saved: "/library/saved",
    completed: "/library/completed",
  },
  account: {
    profile: "/account/profile",
  },
  live: {
    active: "/live/active",
    scheduled: "/live/scheduled",
    ended: "/live/ended",
  },
  progress: {
    get: (lectureId: string) => `/progress/${lectureId}`,
    update: "/progress",
    history: "/progress/history",
  },
} as const;
