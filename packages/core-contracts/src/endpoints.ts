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
    progressSummary: (id: string) => `/listings/${id}/progress-summary`,
    recent: "/listings/recent",
    promotions: "/listings/promotions",
  },
  library: {
    saved: "/me/library/saved",
    savedDelta: "/me/library/saved/delta",
    savedSync: "/me/library/saved/sync",
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
      get: "/audio/progress",
      sync: "/audio/progress/sync",
      update: (listingId: string) => `/audio/progress/${listingId}`,
    },
    listings: {
      stream: (id: string) => `/audio/listings/${id}/stream`,
    },
  },
  admin: {
    users: {
      list: "/admin/users",
      access: (userId: string) => `/admin/users/${userId}/access`,
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
      updateDetails: (id: string) => `/admin/listings/${id}/details`,
      updateMedia: (id: string) => `/admin/listings/${id}/media`,
      mediaData: (id: string) => `/admin/listings/${id}/media-data`,
      formData: (id: string) => `/admin/listings/${id}/form-data`,

      publish: (id: string) => `/admin/listings/${id}/publish`,
      archive: (id: string) => `/admin/listings/${id}/archive`,
      series: "/admin/listings/series",
      bulk: "/admin/listings/bulk",
      arrangeData: (id: string) => `/admin/listings/${id}/arrange-data`,
      arrangeCommit: (id: string) => `/admin/listings/${id}/arrange-commit`,
      promotions: "/admin/listings/promotions",
    },
    media: {
      presignedUrl: "/admin/media/presigned-url",
      presignBatch: "/admin/media/presign-batch",
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
    },
  },
  auth: {},
} as const;
