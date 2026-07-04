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
    topics: (slug: string) => `/scholars/${slug}/topics`,
  },
  collections: {
    detail: (id: string) => `/collections/${id}`,
  },
  series: {
    detail: (id: string) => `/series/${id}`,
  },
  listings: {
    detail: (id: string) => `/listing/${id}`,
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
  audio: {
    progress: {
      list: "/audio/progress",
      update: (lectureId: string) => `/audio/progress/${lectureId}`,
      sync: "/audio/progress/sync",
    },
    lectures: {
      stream: (id: string) => `/audio/lectures/${id}/stream`,
    },
  },
  home: {
    quickbrowse: "/home/quickbrowse",
  },
  admin: {
    users: {
      list: "/admin/users",
    },
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
      list: "/admin/lectures",
      detail: (id: string) => `/admin/lectures/${id}`,
      create: "/admin/lectures",
      update: (id: string) => `/admin/lectures/${id}`,
      publish: (id: string) => `/admin/lectures/${id}/publish`,
      archive: (id: string) => `/admin/lectures/${id}/archive`,
      bulk: "/admin/lectures/bulk",
    },
    series: {
      list: "/admin/series",
      detail: (id: string) => `/admin/series/${id}`,
      create: "/admin/series",
      update: (id: string) => `/admin/series/${id}`,
      publish: (id: string) => `/admin/series/${id}/publish`,
      archive: (id: string) => `/admin/series/${id}/archive`,
      bulk: "/admin/series/bulk",
    },
    collections: {
      list: "/admin/collections",
      detail: (id: string) => `/admin/collections/${id}`,
      create: "/admin/collections",
      update: (id: string) => `/admin/collections/${id}`,
      publish: (id: string) => `/admin/collections/${id}/publish`,
      archive: (id: string) => `/admin/collections/${id}/archive`,
      bulk: "/admin/collections/bulk",
    },
    live: {
      listSessions: "/admin/live/sessions",
      listChannels: "/admin/live/channels",
      createChannel: "/admin/live/channels",
      updateChannel: (id: string) => `/admin/live/channels/${id}`,
      createSession: "/admin/live/sessions",
      updateSession: (id: string) => `/admin/live/sessions/${id}`,
      updateStatus: (id: string) => `/admin/live/sessions/${id}/status`,
    },
    media: {
      presignedUrl: "/admin/media/presigned-url",
    },
  },
  translations: {
    scholars: {
      list: (id: string) => `/scholars/${id}/translations`,
      save: (id: string) => `/scholars/${id}/translations`,
      update: (id: string, locale: string) => `/scholars/${id}/translations/${locale}`,
      publish: (id: string, locale: string) => `/scholars/${id}/translations/${locale}/publish`,
      unpublish: (id: string, locale: string) => `/scholars/${id}/translations/${locale}/unpublish`,
    },
    lectures: {
      list: (id: string) => `/lectures/${id}/translations`,
      save: (id: string) => `/lectures/${id}/translations`,
      update: (id: string, locale: string) => `/lectures/${id}/translations/${locale}`,
      publish: (id: string, locale: string) => `/lectures/${id}/translations/${locale}/publish`,
      unpublish: (id: string, locale: string) => `/lectures/${id}/translations/${locale}/unpublish`,
    },
    topics: {
      list: (id: string) => `/topics/${id}/translations`,
      save: (id: string) => `/topics/${id}/translations`,
      update: (id: string, locale: string) => `/topics/${id}/translations/${locale}`,
      publish: (id: string, locale: string) => `/topics/${id}/translations/${locale}/publish`,
      unpublish: (id: string, locale: string) => `/topics/${id}/translations/${locale}/unpublish`,
    },
    series: {
      list: (scholarId: string, seriesId: string) =>
        `/scholars/${scholarId}/series/${seriesId}/translations`,
      save: (scholarId: string, seriesId: string) =>
        `/scholars/${scholarId}/series/${seriesId}/translations`,
      update: (scholarId: string, seriesId: string, locale: string) =>
        `/scholars/${scholarId}/series/${seriesId}/translations/${locale}`,
      publish: (scholarId: string, seriesId: string, locale: string) =>
        `/scholars/${scholarId}/series/${seriesId}/translations/${locale}/publish`,
      unpublish: (scholarId: string, seriesId: string, locale: string) =>
        `/scholars/${scholarId}/series/${seriesId}/translations/${locale}/unpublish`,
    },
    collections: {
      list: (scholarId: string, collectionId: string) =>
        `/scholars/${scholarId}/collections/${collectionId}/translations`,
      save: (scholarId: string, collectionId: string) =>
        `/scholars/${scholarId}/collections/${collectionId}/translations`,
      update: (scholarId: string, collectionId: string, locale: string) =>
        `/scholars/${scholarId}/collections/${collectionId}/translations/${locale}`,
      publish: (scholarId: string, collectionId: string, locale: string) =>
        `/scholars/${scholarId}/collections/${collectionId}/translations/${locale}/publish`,
      unpublish: (scholarId: string, collectionId: string, locale: string) =>
        `/scholars/${scholarId}/collections/${collectionId}/translations/${locale}/unpublish`,
    },
  },
  auth: {
    updateLocale: "/auth/me/locale",
  },
} as const;
