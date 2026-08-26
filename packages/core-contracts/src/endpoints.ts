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
    detail: (scholarSlug: string) => `/scholars/${scholarSlug}`,
    content: (scholarSlug: string) => `/scholars/${scholarSlug}/content`,
    topics: (scholarSlug: string) => `/scholars/${scholarSlug}/topics`,
  },
  listings: {
    detail: (listingSlug: string) => `/listings/${listingSlug}`,
    contents: (listingSlug: string) => `/listings/${listingSlug}/contents`,
    related: (listingSlug: string) => `/listings/${listingSlug}/related`,
    lastPlayed: (listingSlug: string) => `/listings/${listingSlug}/last-played`,
    progressSummary: (listingSlug: string) => `/listings/${listingSlug}/progress-summary`,
    recent: "/listings/recent",
    promotions: "/listings/promotions",
  },
  myLibrary: {
    saved: "/me/my-library/saved",
    savedDelta: "/me/my-library/saved/delta",
    savedSync: "/me/my-library/saved/sync",
    completed: "/me/my-library/completed",
    progress: "/me/my-library/progress",
    recentProgress: "/me/my-library/recent-progress",
    saveListing: (listingSlug: string) => `/me/my-library/save/${listingSlug}`,
  },
  account: {
    profile: "/account/profile",
    deleteAccount: "/account",
  },
  audio: {
    progress: {
      get: "/audio/progress",
      sync: "/audio/progress/sync",
      update: (listingSlug: string) => `/audio/progress/${listingSlug}`,
    },
    listings: {
      stream: (listingSlug: string) => `/audio/listings/${listingSlug}/stream`,
    },
  },
  admin: {
    dashboard: "/admin/dashboard",
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
      list: (slug: string) => `/listings/${slug}/translations`,
      save: (slug: string) => `/listings/${slug}/translations`,
      update: (slug: string, locale: string) => `/listings/${slug}/translations/${locale}`,
      publish: (slug: string, locale: string) => `/listings/${slug}/translations/${locale}/publish`,
      unpublish: (slug: string, locale: string) =>
        `/listings/${slug}/translations/${locale}/unpublish`,
    },
    topics: {
      list: (id: string) => `/topics/${id}/translations`,
      save: (id: string) => `/topics/${id}/translations`,
      update: (id: string, locale: string) => `/topics/${id}/translations/${locale}`,
    },
  },
  auth: {},
} as const;
