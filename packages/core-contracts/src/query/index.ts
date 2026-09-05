import { QueryClient } from "@tanstack/react-query";

import type { SearchCatalogParams } from "../types";

import { HttpError } from "../http";

/** Shared React Query configuration and stable cache-key vocabulary for API data. */
// Centralized query client configuration
/** Defines the runtime contract value for create query client. */
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
/** Defines the runtime contract value for query keys. */
export const queryKeys = {
  scholars: {
    all: ["scholars"] as const,
    list: {
      all: () => [...queryKeys.scholars.all, "list"] as const,
      infinite: () => [...queryKeys.scholars.all, "list", "infinite"] as const,
    },
    detail: (scholarSlug: string) => [...queryKeys.scholars.all, "detail", scholarSlug] as const,
    content: (scholarSlug: string) => [...queryKeys.scholars.all, "content", scholarSlug] as const,
    topics: (scholarSlug: string) => [...queryKeys.scholars.all, "topics", scholarSlug] as const,
  },
  explore: {
    all: ["explore"] as const,
    feed: (topicSlug?: string, cursor?: string) =>
      [...queryKeys.explore.all, "feed", topicSlug ?? "", cursor] as const,
  },
  listings: {
    all: ["listings"] as const,
    detail: (listingSlug: string) => [...queryKeys.listings.all, "detail", listingSlug] as const,
    contents: (listingSlug: string) =>
      [...queryKeys.listings.all, "contents", listingSlug] as const,
    related: (listingSlug: string) => [...queryKeys.listings.all, "related", listingSlug] as const,
    lastPlayed: (listingSlug: string) =>
      [...queryKeys.listings.all, "last-played", listingSlug] as const,
    progressSummary: (listingSlug: string) =>
      [...queryKeys.listings.all, "progress-summary", listingSlug] as const,
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
  myLibrary: {
    all: ["my-library"] as const,
    saved: {
      all: () => [...queryKeys.myLibrary.all, "saved"] as const,
      infinite: () => [...queryKeys.myLibrary.all, "saved", "infinite"] as const,
    },
    completed: {
      all: () => [...queryKeys.myLibrary.all, "completed"] as const,
      infinite: () => [...queryKeys.myLibrary.all, "completed", "infinite"] as const,
    },
    progress: {
      all: () => [...queryKeys.myLibrary.all, "progress"] as const,
      infinite: () => [...queryKeys.myLibrary.all, "progress", "infinite"] as const,
    },
    recentProgress: () => [...queryKeys.myLibrary.all, "recentProgress"] as const,
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
