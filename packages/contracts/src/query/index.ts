import { QueryClient, QueryKey } from "@tanstack/react-query";

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
} as const;

// Helper type for query key inference
export type QueryKeyOf<T extends (...args: unknown[]) => QueryKey> = ReturnType<T>;
