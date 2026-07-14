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
  listings: {
    detail: (id: string) => `/listings/${id}`,
    related: (id: string) => `/listings/${id}/related`,
  },
  explore: {
    list: "/explore",
    scholars: "/explore/scholars",
    recent: "/explore/recent",
    following: "/explore/following",
  },
  library: {
    saved: "/me/library/saved",
    completed: "/me/library/completed",
    progress: "/me/library/progress",
    saveListing: (listingId: string) => `/me/library/save/${listingId}`,
    syncSaved: "/me/library/saved/sync",
  },
  account: {
    profile: "/account/profile",
    deleteAccount: "/account",
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
      update: (listingId: string) => `/audio/progress/${listingId}`,
      sync: "/audio/progress/sync",
    },
    listings: {
      stream: (id: string) => `/audio/listings/${id}/stream`,
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
      list: (userId: string) => `/admin/users/${userId}/permissions`,
      grant: (userId: string) => `/admin/users/${userId}/permissions`,
      revoke: (userId: string, permission: string) =>
        `/admin/users/${userId}/permissions/${permission}`,
    },
    roles: {
      grant: (userId: string) => `/admin/permissions/${userId}/roles`,
      revoke: (userId: string, role: string) => `/admin/permissions/${userId}/roles/${role}`,
    },
    scholars: {
      list: "/admin/scholars",
      create: "/admin/scholars",
      update: (id: string) => `/admin/scholars/${id}`,
    },
    topics: {
      create: "/admin/topics",
      update: (slug: string) => `/admin/topics/${slug}`,
      delete: (slug: string) => `/admin/topics/${slug}`,
    },
    listings: {
      list: "/admin/listings",
      detail: (id: string) => `/admin/listings/${id}`,
      create: "/admin/listings",
      update: (id: string) => `/admin/listings/${id}`,
      publish: (id: string) => `/admin/listings/${id}/publish`,
      archive: (id: string) => `/admin/listings/${id}/archive`,
      bulk: "/admin/listings/bulk",
    },
    live: {
      listSessions: "/admin/live/sessions",
      listChannels: "/admin/live/channels",
      createChannel: "/admin/live/channels",
      updateChannel: (id: string) => `/admin/live/channels/${id}`,
      deleteChannel: (id: string) => `/admin/live/channels/${id}`,
      createSession: "/admin/live/sessions",
      updateSession: (id: string) => `/admin/live/sessions/${id}`,
      updateStatus: (id: string) => `/admin/live/sessions/${id}/status`,
      deleteSession: (id: string) => `/admin/live/sessions/${id}`,
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
    listings: {
      list: (id: string) => `/listings/${id}/translations`,
      save: (id: string) => `/listings/${id}/translations`,
      update: (id: string, locale: string) => `/listings/${id}/translations/${locale}`,
      publish: (id: string, locale: string) => `/listings/${id}/translations/${locale}/publish`,
      unpublish: (id: string, locale: string) => `/listings/${id}/translations/${locale}/unpublish`,
    },
    topics: {
      list: (id: string) => `/topics/${id}/translations`,
      save: (id: string) => `/topics/${id}/translations`,
      update: (id: string, locale: string) => `/topics/${id}/translations/${locale}`,
      publish: (id: string, locale: string) => `/topics/${id}/translations/${locale}/publish`,
      unpublish: (id: string, locale: string) => `/topics/${id}/translations/${locale}/unpublish`,
    },
  },
  auth: {
    updateLocale: "/auth/me/locale",
  },
} as const;
