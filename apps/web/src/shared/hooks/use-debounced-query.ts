import { useEffect, useState } from "react";

export interface UseDebouncedSearchOptions {
  delay?: number;
  initialValue?: string;
}

export interface UseDebouncedSearchResult {
  query: string;
  setQuery: (value: string) => void;
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
