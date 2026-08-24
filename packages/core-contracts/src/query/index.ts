import { QueryClient } from "@tanstack/react-query";

import type { SearchCatalogParams } from "../types";

import { HttpError } from "../http";

// Centralized query client configuration
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: (failureCount, cause: unknown) => {
          // Don't retry on 4xx errors (client errors)
          if (cause instanceof HttpError && cause.status >= 400 && cause.status < 500) {
            return false;
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
    content: (slug: string) => [...queryKeys.scholars.all, "content", slug] as const,
    topics: (slug: string) => [...queryKeys.scholars.all, "topics", slug] as const,
  },
  listings: {
    all: ["listings"] as const,
    detail: (slug: string) => [...queryKeys.listings.all, "detail", slug] as const,
    contents: (slug: string) => [...queryKeys.listings.all, "contents", slug] as const,
    lastPlayed: (slug: string) => [...queryKeys.listings.all, "last-played", slug] as const,
    recent: (topicSlug?: string, cursor?: string) =>
      [...queryKeys.listings.all, "recent", topicSlug ?? "", cursor] as const,
  },
  topics: {
    all: ["topics"] as const,
  },
  search: {
    all: ["search"] as const,
    catalog: (params: SearchCatalogParams) => [...queryKeys.search.all, "catalog", params] as const,
    // NEW: pagination support
    infinite: (params: SearchCatalogParams) =>
      [...queryKeys.search.all, "infinite", params] as const,
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
    recentProgress: () => [...queryKeys.library.all, "recentProgress"] as const,
  },
  account: {
    all: ["account"] as const,
    profile: () => [...queryKeys.account.all, "profile"] as const,
  },
  admin: {
    all: ["admin"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
    users: {
      all: () => [...queryKeys.admin.all, "users"] as const,
      list: (query?: string, role?: string) =>
        [...queryKeys.admin.all, "users", "list", query, role] as const,
      // NEW: pagination support
      infinite: (search?: string, role?: string) =>
        [...queryKeys.admin.all, "users", "infinite", search ?? "", role ?? ""] as const,
    },
    scholars: {
      all: () => [...queryKeys.admin.all, "scholars"] as const,
      list: () => [...queryKeys.admin.all, "scholars", "list"] as const,
      // NEW: pagination support
      infinite: (search?: string) =>
        [...queryKeys.admin.all, "scholars", "infinite", search ?? ""] as const,
    },
    listings: {
      all: () => [...queryKeys.admin.all, "listings"] as const,
      // NEW: pagination support
      infinite: (search?: string) =>
        [...queryKeys.admin.all, "listings", "infinite", search ?? ""] as const,
      series: (scholarId?: string) =>
        [...queryKeys.admin.all, "listings", "series", scholarId ?? ""] as const,
    },
    topics: {
      all: () => [...queryKeys.admin.all, "topics"] as const,
      detail: (slug: string) => [...queryKeys.admin.topics.all(), "detail", slug] as const,
    },
  },
} as const;
