import { useEffect, useMemo, useState } from "react";
import { useSearchCatalog, useTopicsList } from "../api/search.api";
import {
  buildSearchResultRows,
  type SearchResultRow,
} from "../utils/build-search-result-rows";

export type SearchFilterValue = string[];

export type UseSearchProcessingOptions = {
  prefill?: string;
};

export function useSearchProcessing({ prefill }: UseSearchProcessingOptions = {}) {
  const [query, setQuery] = useState(prefill || "");
  const [debouncedQuery, setDebouncedQuery] = useState(prefill || "");
  const [filter, setFilter] = useState<SearchFilterValue>([]);

  useEffect(() => {
    setQuery(prefill || "");
    setDebouncedQuery(prefill || "");
  }, [prefill]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const shouldSearch = debouncedQuery.length > 0;

  const { data, isFetching, error } = useSearchCatalog(
    {
      q: debouncedQuery,
      limit: 20,
      topicSlugs: filter.length ? filter : undefined,
    },
    { enabled: shouldSearch },
  );

  const { data: topics = [] } = useTopicsList();

  const items = useMemo<SearchResultRow[]>(() => buildSearchResultRows(data), [data]);

  const errorMessage = useMemo(() => {
    if (!error) {
      return undefined;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Unable to reach the server.";
  }, [error]);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    topics,
    items,
    isFetching,
    shouldSearch,
    errorMessage,
  };
}
