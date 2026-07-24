import { QueryClient } from "@tanstack/react-query";
import type { SearchCatalogParams } from "../types";
import { DEFAULT_MAX_AGE } from "./persist";

export * from "./persist";

// Centralized query client configuration
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: DEFAULT_MAX_AGE, // 24 hours (for persistence)
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
    content: (slug: string) => [...queryKeys.scholars.all, "content", slug] as const,
    topics: (slug: string) => [...queryKeys.scholars.all, "topics", slug] as const,
  },
  listings: {
    all: ["listings"] as const,
    detail: (id: string, slug?: string) => [...queryKeys.listings.all, "detail", id, slug] as const,
    contents: (id: string) => [...queryKeys.listings.all, "contents", id] as const,
    lastPlayed: (id: string) => [...queryKeys.listings.all, "last-played", id] as const,
    recent: (cursor?: string) => [...queryKeys.listings.all, "recent", cursor] as const,
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
      formatTransition: (id: string) =>
        [...queryKeys.admin.all, "listings", "format-transition", id] as const,
    },
    topics: {
      all: () => [...queryKeys.admin.all, "topics"] as const,
      detail: (slug: string) => [...queryKeys.admin.topics.all(), "detail", slug] as const,
    },
  },
} as const;
