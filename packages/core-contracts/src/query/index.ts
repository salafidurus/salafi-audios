import { QueryClient } from "@tanstack/react-query";
import type { SearchCatalogParams } from "../types";

// Centralized query client configuration
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors (client errors)
          if (
            error &&
            typeof error === "object" &&
            "status" in error &&
            typeof (error as { status: unknown }).status === "number"
          ) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });

// Common query keys for type-safe cache management
export const queryKeys = {
  scholars: {
    all: ["scholars"] as const,
    list: () => [...queryKeys.scholars.all, "list"] as const,
    detail: (slug: string) => [...queryKeys.scholars.all, "detail", slug] as const,
    stats: (slug: string) => [...queryKeys.scholars.all, "stats", slug] as const,
    content: (slug: string) => [...queryKeys.scholars.all, "content", slug] as const,
    topics: (slug: string) => [...queryKeys.scholars.all, "topics", slug] as const,
  },
  listings: {
    all: ["listings"] as const,
    detail: (id: string, slug?: string) => [...queryKeys.listings.all, "detail", id, slug] as const,
  },
  topics: {
    all: ["topics"] as const,
    list: () => [...queryKeys.topics.all, "list"] as const,
    listings: (slug: string) => [...queryKeys.topics.all, "listings", slug] as const,
  },
  recommendations: {
    all: ["recommendations"] as const,
    hero: () => [...queryKeys.recommendations.all, "hero"] as const,
    popular: (params?: Record<string, unknown>) =>
      [...queryKeys.recommendations.all, "popular", params] as const,
    latest: (params?: Record<string, unknown>) =>
      [...queryKeys.recommendations.all, "latest", params] as const,
  },
  search: {
    all: ["search"] as const,
    catalog: (params: SearchCatalogParams) => [...queryKeys.search.all, "catalog", params] as const,
  },
  explore: {
    all: ["explore"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.explore.all, "list", params] as const,
    scholars: () => [...queryKeys.explore.all, "scholars"] as const,
    recent: (cursor?: string) => [...queryKeys.explore.all, "recent", cursor] as const,
    following: (cursor?: string) => [...queryKeys.explore.all, "following", cursor] as const,
  },
  library: {
    all: ["library"] as const,
    saved: (cursor?: string) => [...queryKeys.library.all, "saved", cursor] as const,
    completed: (cursor?: string) => [...queryKeys.library.all, "completed", cursor] as const,
    progress: (cursor?: string) => [...queryKeys.library.all, "progress", cursor] as const,
  },
  account: {
    all: ["account"] as const,
    profile: () => [...queryKeys.account.all, "profile"] as const,
  },
  live: {
    all: ["live"] as const,
    channels: () => [...queryKeys.live.all, "channels"] as const,
    channelBySlug: (slug: string) => [...queryKeys.live.all, "channel", slug] as const,
    active: () => [...queryKeys.live.all, "active"] as const,
    scheduled: () => [...queryKeys.live.all, "scheduled"] as const,
    ended: (cursor?: string) => [...queryKeys.live.all, "ended", cursor] as const,
  },
  progress: {
    all: ["progress"] as const,
    listing: (listingId: string) => [...queryKeys.progress.all, "listing", listingId] as const,
    history: () => [...queryKeys.progress.all, "history"] as const,
  },
  home: {
    all: ["home"] as const,
    quickbrowse: (params?: Record<string, unknown>) =>
      [...queryKeys.home.all, "quickbrowse", params] as const,
  },
  admin: {
    all: ["admin"] as const,
    permissions: {
      all: () => [...queryKeys.admin.all, "permissions"] as const,
      me: () => [...queryKeys.admin.all, "permissions", "me"] as const,
      user: (userId: string) => [...queryKeys.admin.all, "permissions", userId] as const,
    },
    users: {
      all: () => [...queryKeys.admin.all, "users"] as const,
      list: (query?: string) => [...queryKeys.admin.all, "users", "list", query] as const,
    },
    scholars: {
      all: () => [...queryKeys.admin.all, "scholars"] as const,
      list: () => [...queryKeys.admin.all, "scholars", "list"] as const,
    },
    topics: {
      all: () => [...queryKeys.admin.all, "topics"] as const,
      list: () => [...queryKeys.admin.all, "topics", "list"] as const,
    },
    live: {
      all: () => [...queryKeys.admin.all, "live"] as const,
      sessions: () => [...queryKeys.admin.all, "live", "sessions"] as const,
    },
  },
} as const;
