"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type SearchCatalogResultsDto,
  type SearchCatalogParams,
  type TopicDetailDto,
  queryKeys,
  endpoints,
} from "@sd/core-contracts";
import { useApiQuery } from "@sd/core-contracts/query/hooks";
import { httpClient } from "@sd/core-contracts/http";
import { SearchProcessingDesktopWebView } from "../../components/SearchProcessingDesktopView/SearchProcessingDesktopView.desktop.web";
import { buildSearchResultItems } from "../../utils/build-search-result-items";

export function SearchProcessingDesktopWebScreen() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldSearch = query.trim().length > 0;
  const params: SearchCatalogParams = {
    q: query.trim(),
    topicSlugs: filters.length > 0 ? filters : undefined,
  };

  const { data, isFetching, error } = useApiQuery<SearchCatalogResultsDto>(
    queryKeys.search.catalog(params),
    () =>
      httpClient<SearchCatalogResultsDto>({
        url: endpoints.search.extended,
        method: "GET",
        params,
      }),
    { enabled: shouldSearch },
  );

  const { data: topics } = useApiQuery<TopicDetailDto[]>(
    queryKeys.topics.list(),
    () =>
      httpClient<TopicDetailDto[]>({
        url: endpoints.topics.list,
        method: "GET",
      }),
    { enabled: true },
  );

  const results = useMemo(() => buildSearchResultItems(data), [data]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SearchProcessingDesktopWebView
      inputRef={inputRef}
      query={query}
      onQueryChange={setQuery}
      filters={filters}
      onFiltersChange={setFilters}
      topics={topics ?? []}
      results={results}
      isFetching={isFetching}
      shouldSearch={shouldSearch}
      error={error}
    />
  );
}
