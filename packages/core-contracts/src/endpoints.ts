/** Shared canonical application API paths for every platform client. */
const APPLICATION_API_PREFIX = "/v1";

/**
 * Prefixes ordinary application API routes with the canonical compatibility
 * namespace. Better Auth, operational, and external URLs are intentionally
 * outside this builder and must retain their own route boundaries.
 */
const applicationPath = (path: string): string => `${APPLICATION_API_PREFIX}${path}`;

/**
 * Canonical application API paths shared by web, native, and backend-facing
 * clients. Every path uses the `/v1` compatibility namespace; Better Auth,
 * operational, and external URLs retain separate route boundaries.
 */
export const endpoints = {
  search: {
    general: applicationPath("/search"),
    extended: applicationPath("/search/extended"),
  },
  topics: {
    list: applicationPath("/topics"),
  },
  scholars: {
    list: applicationPath("/scholars"),
    detail: (scholarSlug: string) => applicationPath(`/scholars/${scholarSlug}`),
    content: (scholarSlug: string) => applicationPath(`/scholars/${scholarSlug}/content`),
    topics: (scholarSlug: string) => applicationPath(`/scholars/${scholarSlug}/topics`),
  },
  listings: {
    detail: (listingSlug: string) => applicationPath(`/listings/${listingSlug}`),
    contents: (listingSlug: string) => applicationPath(`/listings/${listingSlug}/contents`),
    related: (listingSlug: string) => applicationPath(`/listings/${listingSlug}/related`),
    lastPlayed: (listingSlug: string) => applicationPath(`/listings/${listingSlug}/last-played`),
    progressSummary: (listingSlug: string) =>
      applicationPath(`/listings/${listingSlug}/progress-summary`),
    recent: applicationPath("/listings/recent"),
    promotions: applicationPath("/listings/promotions"),
  },
  myLibrary: {
    saved: applicationPath("/me/my-library/saved"),
    savedDelta: applicationPath("/me/my-library/saved/delta"),
    savedSync: applicationPath("/me/my-library/saved/sync"),
    completed: applicationPath("/me/my-library/completed"),
    progress: applicationPath("/me/my-library/progress"),
    recentProgress: applicationPath("/me/my-library/recent-progress"),
    saveListing: (listingSlug: string) => applicationPath(`/me/my-library/save/${listingSlug}`),
  },
  account: {
    profile: applicationPath("/account/profile"),
    deleteAccount: applicationPath("/account"),
  },
  audio: {
    progress: {
      get: applicationPath("/audio/progress"),
      sync: applicationPath("/audio/progress/sync"),
      update: (listingSlug: string) => applicationPath(`/audio/progress/${listingSlug}`),
    },
    listings: {
      stream: (listingSlug: string) => applicationPath(`/audio/listings/${listingSlug}/stream`),
    },
  },
  admin: {
    dashboard: applicationPath("/admin/dashboard"),
    users: {
      list: applicationPath("/admin/users"),
      access: (userId: string) => applicationPath(`/admin/users/${userId}/access`),
    },
    scholars: {
      list: applicationPath("/admin/scholars"),
      create: applicationPath("/admin/scholars"),
      update: (id: string) => applicationPath(`/admin/scholars/${id}`),
      formData: (id: string) => applicationPath(`/admin/scholars/${id}/form-data`),
    },
    topics: {
      list: applicationPath("/admin/topics"),
      create: applicationPath("/admin/topics"),
      detail: (slug: string) => applicationPath(`/admin/topics/${slug}`),
      update: (slug: string) => applicationPath(`/admin/topics/${slug}`),
      delete: (slug: string) => applicationPath(`/admin/topics/${slug}`),
    },
    listings: {
      list: applicationPath("/admin/listings"),
      detail: (id: string) => applicationPath(`/admin/listings/${id}`),
      create: applicationPath("/admin/listings"),
      update: (id: string) => applicationPath(`/admin/listings/${id}`),
      updateDetails: (id: string) => applicationPath(`/admin/listings/${id}/details`),
      updateMedia: (id: string) => applicationPath(`/admin/listings/${id}/media`),
      mediaData: (id: string) => applicationPath(`/admin/listings/${id}/media-data`),
      formData: (id: string) => applicationPath(`/admin/listings/${id}/form-data`),

      publish: (id: string) => applicationPath(`/admin/listings/${id}/publish`),
      archive: (id: string) => applicationPath(`/admin/listings/${id}/archive`),
      series: applicationPath("/admin/listings/series"),
      bulk: applicationPath("/admin/listings/bulk"),
      arrangeData: (id: string) => applicationPath(`/admin/listings/${id}/arrange-data`),
      arrangeCommit: (id: string) => applicationPath(`/admin/listings/${id}/arrange-commit`),
      promotions: applicationPath("/admin/listings/promotions"),
    },
    media: {
      presignedUrl: applicationPath("/admin/media/presigned-url"),
      presignBatch: applicationPath("/admin/media/presign-batch"),
    },
  },
  translations: {
    scholars: {
      list: (id: string) => applicationPath(`/scholars/${id}/translations`),
      save: (id: string) => applicationPath(`/scholars/${id}/translations`),
      update: (id: string, locale: string) =>
        applicationPath(`/scholars/${id}/translations/${locale}`),
      publish: (id: string, locale: string) =>
        applicationPath(`/scholars/${id}/translations/${locale}/publish`),
      unpublish: (id: string, locale: string) =>
        applicationPath(`/scholars/${id}/translations/${locale}/unpublish`),
    },
    listings: {
      list: (slug: string) => applicationPath(`/listings/${slug}/translations`),
      save: (slug: string) => applicationPath(`/listings/${slug}/translations`),
      update: (slug: string, locale: string) =>
        applicationPath(`/listings/${slug}/translations/${locale}`),
      publish: (slug: string, locale: string) =>
        applicationPath(`/listings/${slug}/translations/${locale}/publish`),
      unpublish: (slug: string, locale: string) =>
        applicationPath(`/listings/${slug}/translations/${locale}/unpublish`),
    },
    topics: {
      list: (id: string) => applicationPath(`/topics/${id}/translations`),
      save: (id: string) => applicationPath(`/topics/${id}/translations`),
      update: (id: string, locale: string) =>
        applicationPath(`/topics/${id}/translations/${locale}`),
    },
  },
  auth: {},
} as const;
