import { useEffect, useState } from "react";

/** Provides immediate input state and delayed values for network-backed search. */
/** Configures the delay and initial value for a debounced search query. */
export interface UseDebouncedSearchOptions {
  /** Delay before the debounced value follows the current query. */
  delay?: number;
  /** Initial controlled value shown before the first edit. */
  initialValue?: string;
}

/** Immediate input state together with its delayed API-facing value. */
export interface UseDebouncedSearchResult {
  /** Current input value, updated on every setter call. */
  query: string;
  /** Updates the immediate input value. */
  setQuery: (value: string) => void;
  /** Query value updated after the configured delay. */
  debouncedQuery: string;
}

/**
 * Hook that manages both immediate search state and debounced version.
 * Useful for search inputs where you want to update UI immediately but debounce API calls.
 * Returns both the immediate query state and the debounced version.
 */
export function useDebouncedSearch(options?: UseDebouncedSearchOptions): UseDebouncedSearchResult {
  const delay = options?.delay ?? 300;
  const [query, setQuery] = useState(options?.initialValue ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return { query, setQuery, debouncedQuery };
}
