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
// NOTE: Extended with pagination/infinite keys while maintaining full backward compatibility
export const queryKeys = {
  scholars: {
    all: ["scholars"] as const,
    list: {
      all: () => [...queryKeys.scholars.all, "list"] as const,
      infinite: () => [...queryKeys.scholars.all, "list", "infinite"] as const,
    },
    detail: (slug: string) => [...queryKeys.scholars.all, "detail", slug] as const,
    stats: (slug: string) => [...queryKeys.scholars.all, "stats", slug] as const,
    content: (slug: string) => [...queryKeys.scholars.all, "content", slug] as const,
    topics: (slug: string) => [...queryKeys.scholars.all, "topics", slug] as const,
    // NEW: pagination support (legacy keys)
    list_infinite: () => [...queryKeys.scholars.all, "list", "infinite"] as const,
    content_infinite: (slug: string) =>
      [...queryKeys.scholars.all, "content", slug, "infinite"] as const,
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
    // NEW: pagination support
    infinite: (query: string) => [...queryKeys.search.all, "infinite", query] as const,
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
    saved: {
      all: () => [...queryKeys.library.all, "saved"] as const,
      infinite: () => [...queryKeys.library.all, "saved", "infinite"] as const,
    },
    completed: {
      all: () => [...queryKeys.library.all, "completed"] as const,
      infinite: () => [...queryKeys.library.all, "completed", "infinite"] as const,
    },
    progress: {
      all: () => [...queryKeys.library.all, "progress"] as const,
      infinite: () => [...queryKeys.library.all, "progress", "infinite"] as const,
    },
  },
  account: {
    all: ["account"] as const,
    profile: () => [...queryKeys.account.all, "profile"] as const,
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
      list: (query?: string, role?: string) =>
        [...queryKeys.admin.all, "users", "list", query, role] as const,
      // NEW: pagination support
      infinite: () => [...queryKeys.admin.all, "users", "infinite"] as const,
    },
    scholars: {
      all: () => [...queryKeys.admin.all, "scholars"] as const,
      list: () => [...queryKeys.admin.all, "scholars", "list"] as const,
      // NEW: pagination support
      infinite: () => [...queryKeys.admin.all, "scholars", "infinite"] as const,
    },
    listings: {
      all: () => [...queryKeys.admin.all, "listings"] as const,
      // NEW: pagination support
      infinite: () => [...queryKeys.admin.all, "listings", "infinite"] as const,
    },
    topics: {
      all: () => [...queryKeys.admin.all, "topics"] as const,
      list: () => [...queryKeys.admin.all, "topics", "list"] as const,
    },
  },
} as const;
