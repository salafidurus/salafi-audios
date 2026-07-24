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
    content: (slug: string) => `/scholars/${slug}/content`,
    topics: (slug: string) => `/scholars/${slug}/topics`,
  },
  listings: {
    detail: (id: string) => `/listings/${id}`,
    contents: (id: string) => `/listings/${id}/contents`,
    lastPlayed: (id: string) => `/listings/${id}/last-played`,
    recent: "/listings/recent",
  },
  library: {
    saved: "/me/library/saved",
    completed: "/me/library/completed",
    progress: "/me/library/progress",
    recentProgress: "/me/library/recent-progress",
    saveListing: (listingId: string) => `/me/library/save/${listingId}`,
  },
  account: {
    profile: "/account/profile",
    deleteAccount: "/account",
  },
  audio: {
    progress: {
      update: (listingId: string) => `/audio/progress/${listingId}`,
    },
    listings: {
      stream: (id: string) => `/audio/listings/${id}/stream`,
    },
  },
  admin: {
    users: {
      list: "/admin/users",
    },
    permissions: {
      list: (userId: string) => `/admin/users/${userId}/permissions`,
      grant: (userId: string) => `/admin/permissions/${userId}/permissions`,
      revoke: (userId: string, permission: string) =>
        `/admin/permissions/${userId}/permissions/${permission}`,
    },
    roles: {
      grant: (userId: string) => `/admin/permissions/${userId}/roles`,
      revoke: (userId: string, role: string) => `/admin/permissions/${userId}/roles/${role}`,
    },
    scholars: {
      list: "/admin/scholars",
      create: "/admin/scholars",
      update: (id: string) => `/admin/scholars/${id}`,
      formData: (id: string) => `/admin/scholars/${id}/form-data`,
    },
    topics: {
      list: "/admin/topics",
      create: "/admin/topics",
      detail: (slug: string) => `/admin/topics/${slug}`,
      update: (slug: string) => `/admin/topics/${slug}`,
      delete: (slug: string) => `/admin/topics/${slug}`,
    },
    listings: {
      list: "/admin/listings",
      detail: (id: string) => `/admin/listings/${id}`,
      create: "/admin/listings",
      update: (id: string) => `/admin/listings/${id}`,
      formData: (id: string) => `/admin/listings/${id}/form-data`,
      publish: (id: string) => `/admin/listings/${id}/publish`,
      archive: (id: string) => `/admin/listings/${id}/archive`,
      formatTransition: (id: string) => `/admin/listings/${id}/format-transition`,
      promote: (id: string) => `/admin/listings/${id}/promote`,
      demote: (id: string) => `/admin/listings/${id}/demote`,
      series: "/admin/listings/series",
      bulk: "/admin/listings/bulk",
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
  auth: {},
} as const;
