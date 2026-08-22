import { useCallback, useEffect, useState } from "react";

import { useDebouncedSearch } from "@/shared/hooks";

import {
  DEFAULT_EXPLORE_FILTERS,
  exploreFiltersStorageKey,
  readExploreFilters,
  type ExploreFilters,
  writeExploreFilters,
} from "../utils/explore-filters";

export type UseExploreFiltersOptions = {
  locale: string;
  userId?: string;
};

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useExploreFilters({ locale, userId }: UseExploreFiltersOptions) {
  const { query, setQuery: setSearchQuery, debouncedQuery } = useDebouncedSearch();
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
    setFilters(storedFilters);
    setSearchQuery(storedFilters.query);
    setHydratedStorageKey(storageKey);
  }, [setSearchQuery, storageKey]);

  const persist = useCallback(
    (nextFilters: ExploreFilters) => {
      const storage = browserStorage();
      if (storage) writeExploreFilters(storage, storageKey, nextFilters);
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

  const setQuery = useCallback(
    (value: string) => {
      setSearchQuery(value);
      updateFilter("query", value);
    },
    [setSearchQuery, updateFilter],
  );

  const clearFilter = useCallback(
    (key: keyof ExploreFilters) => {
      updateFilter(key, key === "sort" ? "recent" : "");
      if (key === "query") setSearchQuery("");
    },
    [setSearchQuery, updateFilter],
  );

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_EXPLORE_FILTERS);
    setSearchQuery("");
    persist(DEFAULT_EXPLORE_FILTERS);
  }, [persist, setSearchQuery]);

  return {
    filters,
    query,
    debouncedQuery,
    storageKey,
    isHydrated: hydratedStorageKey === storageKey,
    setQuery,
    updateFilter,
    clearFilter,
    clearAll,
  };
}
