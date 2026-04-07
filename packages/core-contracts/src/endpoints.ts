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
    related: (id: string) => `/lectures/${id}/related`,
  },
  feed: {
    list: "/feed",
    scholars: "/feed/scholars",
    recent: "/feed/recent",
    following: "/feed/following",
  },
  library: {
    saved: "/me/library/saved",
    completed: "/me/library/completed",
    progress: "/me/library/progress",
    saveLecture: (lectureId: string) => `/me/library/save/${lectureId}`,
    syncSaved: "/me/library/saved/sync",
  },
  account: {
    profile: "/account/profile",
  },
  live: {
    channels: "/live/channels",
    channelBySlug: (slug: string) => `/live/channels/${slug}`,
    active: "/live/active",
    upcoming: "/live/upcoming",
    ended: "/live/ended",
  },
  progress: {
    list: "/me/progress",
    update: (lectureId: string) => `/me/progress/${lectureId}`,
    sync: "/me/progress/sync",
  },
  home: {
    quickbrowse: "/home/quickbrowse",
  },
  admin: {
    permissions: {
      me: "/admin/permissions/me",
      list: "/admin/permissions",
      grant: "/admin/permissions",
      revoke: (id: string) => `/admin/permissions/${id}`,
    },
    scholars: {
      create: "/admin/scholars",
      update: (id: string) => `/admin/scholars/${id}`,
    },
    topics: {
      create: "/admin/topics",
      update: (slug: string) => `/admin/topics/${slug}`,
      delete: (slug: string) => `/admin/topics/${slug}`,
    },
    lectures: {
      update: (id: string) => `/admin/lectures/${id}`,
      publish: (id: string) => `/admin/lectures/${id}/publish`,
      archive: (id: string) => `/admin/lectures/${id}/archive`,
    },
    live: {
      updateStatus: (id: string) => `/admin/live/sessions/${id}/status`,
    },
  },
} as const;
