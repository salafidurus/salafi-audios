import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_EXPLORE_FILTERS,
  exploreFiltersStorageKey,
  readExploreFilters,
  type ExploreFilters,
  writeExploreFilters,
} from "../utils/explore-filters";

/** Documents this module's responsibility and public boundary. */
/** Locale and optional identity used to isolate persisted Explore filters. */
export type UseExploreFiltersOptions = {
  locale: string;
  /** Authenticated user identity; absent uses the anonymous filter namespace. */
  userId?: string;
};

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Loads, updates, and persists Explore filters for the active locale and user. */
export function useExploreFilters({ locale, userId }: UseExploreFiltersOptions) {
  const storageKey = exploreFiltersStorageKey(locale, userId);
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_EXPLORE_FILTERS);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);

  useEffect(() => {
    const storage = browserStorage();
    if (!storage) {
      setHydratedStorageKey(storageKey);
      return;
    }

    const storedFilters = readExploreFilters(storage, storageKey);
    setFilters({ ...DEFAULT_EXPLORE_FILTERS, topic: storedFilters.topic });
    setHydratedStorageKey(storageKey);
  }, [storageKey]);

  const persist = useCallback(
    (nextFilters: ExploreFilters) => {
      const storage = browserStorage();
      if (storage) {
        writeExploreFilters(storage, storageKey, {
          ...DEFAULT_EXPLORE_FILTERS,
          topic: nextFilters.topic,
        });
      }
    },
    [storageKey],
  );

  const updateFilter = useCallback(
    <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => {
      setFilters((current) => {
        const next = { ...current, [key]: value };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const clearFilter = useCallback(
    (key: keyof ExploreFilters) => {
      updateFilter(key, key === "sort" ? "recent" : "");
    },
    [updateFilter],
  );

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_EXPLORE_FILTERS);
    persist(DEFAULT_EXPLORE_FILTERS);
  }, [persist]);

  return {
    filters,
    query: "",
    debouncedQuery: "",
    storageKey,
    isHydrated: hydratedStorageKey === storageKey,
    setQuery: () => undefined,
    updateFilter,
    clearFilter,
    clearAll,
  };
}
