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
  },
  series: {
    all: ["series"] as const,
    list: (scholarSlug: string) => [...queryKeys.series.all, "list", scholarSlug] as const,
    detail: (scholarSlug: string, seriesSlug: string) =>
      [...queryKeys.series.all, "detail", scholarSlug, seriesSlug] as const,
    lectures: (scholarSlug: string, seriesSlug: string) =>
      [...queryKeys.series.all, "lectures", scholarSlug, seriesSlug] as const,
  },
  lectures: {
    all: ["lectures"] as const,
    list: (scholarSlug: string) => [...queryKeys.lectures.all, "list", scholarSlug] as const,
    detail: (scholarSlug: string, lectureSlug: string) =>
      [...queryKeys.lectures.all, "detail", scholarSlug, lectureSlug] as const,
  },
  collections: {
    all: ["collections"] as const,
    list: (scholarSlug: string) => [...queryKeys.collections.all, "list", scholarSlug] as const,
    detail: (scholarSlug: string, collectionSlug: string) =>
      [...queryKeys.collections.all, "detail", scholarSlug, collectionSlug] as const,
  },
  topics: {
    all: ["topics"] as const,
    list: () => [...queryKeys.topics.all, "list"] as const,
    lectures: (slug: string) => [...queryKeys.topics.all, "lectures", slug] as const,
  },
  recommendations: {
    all: ["recommendations"] as const,
    hero: () => [...queryKeys.recommendations.all, "hero"] as const,
    popular: (params?: Record<string, unknown>) =>
      [...queryKeys.recommendations.all, "popular", params] as const,
    latest: (params?: Record<string, unknown>) =>
      [...queryKeys.recommendations.all, "latest", params] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    stats: () => [...queryKeys.analytics.all, "stats"] as const,
  },
  search: {
    all: ["search"] as const,
    catalog: (params: SearchCatalogParams) => [...queryKeys.search.all, "catalog", params] as const,
  },
  feed: {
    all: ["feed"] as const,
    recent: (cursor?: string) => [...queryKeys.feed.all, "recent", cursor] as const,
    following: (cursor?: string) => [...queryKeys.feed.all, "following", cursor] as const,
  },
  library: {
    all: ["library"] as const,
    saved: (cursor?: string) => [...queryKeys.library.all, "saved", cursor] as const,
    completed: (cursor?: string) => [...queryKeys.library.all, "completed", cursor] as const,
  },
  account: {
    all: ["account"] as const,
    profile: () => [...queryKeys.account.all, "profile"] as const,
  },
  live: {
    all: ["live"] as const,
    active: () => [...queryKeys.live.all, "active"] as const,
    scheduled: () => [...queryKeys.live.all, "scheduled"] as const,
    ended: (cursor?: string) => [...queryKeys.live.all, "ended", cursor] as const,
  },
  progress: {
    all: ["progress"] as const,
    lecture: (lectureId: string) => [...queryKeys.progress.all, "lecture", lectureId] as const,
    history: () => [...queryKeys.progress.all, "history"] as const,
  },
} as const;
