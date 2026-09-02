import { z } from "zod";

/** Documents this module's responsibility and public boundary. */
export const EXPLORE_FILTERS_STORAGE_PREFIX = "salafi-durus:explore-filters:v1";

export const EXPLORE_SORT_OPTIONS = ["recent", "title-asc", "title-desc"] as const;
export type ExploreSort = (typeof EXPLORE_SORT_OPTIONS)[number];

export type ExploreFilters = {
  query: string;
  scholar: string;
  topic: string;
  format: string;
  language: string;
  sort: ExploreSort;
};

export const DEFAULT_EXPLORE_FILTERS: ExploreFilters = {
  query: "",
  scholar: "",
  topic: "",
  format: "",
  language: "",
  sort: "recent",
};

export function exploreFiltersStorageKey(locale: string, userId?: string): string {
  return `${EXPLORE_FILTERS_STORAGE_PREFIX}:${locale}:${userId ?? "anonymous"}`;
}

const ExploreFiltersStorageSchema = z.object({
  query: z.string().default(""),
  scholar: z.string().default(""),
  topic: z.string().default(""),
  format: z.string().default(""),
  language: z.string().default(""),
  sort: z.enum(EXPLORE_SORT_OPTIONS).default("recent"),
});
export function readExploreFilters(storage: Storage, key: string): ExploreFilters {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "null");
    const result = ExploreFiltersStorageSchema.safeParse(parsed);
    return result.success ? result.data : DEFAULT_EXPLORE_FILTERS;
  } catch {
    return DEFAULT_EXPLORE_FILTERS;
  }
}

export function writeExploreFilters(storage: Storage, key: string, filters: ExploreFilters): void {
  try {
    storage.setItem(key, JSON.stringify(filters));
  } catch {
    // Storage can be unavailable in private browsing or when its quota is full.
  }
}

export function sortExploreItems<T extends { title: string }>(
  items: readonly T[],
  sort: ExploreSort,
  locale: string,
): T[] {
  if (sort === "recent") return [...items];
  const direction = sort === "title-asc" ? 1 : -1;
  return [...items].sort(
    (left, right) => direction * left.title.localeCompare(right.title, locale),
  );
}
