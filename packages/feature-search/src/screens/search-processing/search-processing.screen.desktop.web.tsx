"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Suspense } from "react";
import {
  type SearchCatalogResultsDto,
  type SearchCatalogParams,
  type TopicDetailDto,
  queryKeys,
  endpoints,
} from "@sd/core-contracts";
import { useApiQuery } from "@sd/core-contracts/query/hooks";
import { httpClient } from "@sd/core-contracts/http";
import { SearchFilterDesktopWeb } from "../../components/SearchFilter/SearchFilter.desktop.web";
import { SearchInputDesktopWeb } from "../../components/SearchInput/SearchInput.desktop.web";
import { SearchResultItemDesktopWeb } from "../../components/SearchResultItem/SearchResultItem.desktop.web";
import { SearchResultsListDesktopWeb } from "../../components/SearchResultsList/SearchResultsList.desktop.web";
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

  const errorMessage =
    error instanceof Error ? error.message : error ? "Unable to reach the server." : undefined;

  return (
    <main className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 bg-[color-mix(in_srgb,var(--surface-canvas)_86%,transparent)] px-[var(--space-layout-page-x)] pt-[var(--space-layout-page-y)] pb-[var(--space-component-gap-md)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-[var(--space-component-gap-md)]">
          <SearchInputDesktopWeb
            ref={inputRef}
            placeholder="Search"
            value={query}
            onChange={setQuery}
            autoFocus
          />
          <SearchFilterDesktopWeb value={filters} onChange={setFilters} topics={topics ?? []} />
        </div>
      </div>
      <section className="mx-auto w-full max-w-[70rem] px-[var(--space-layout-page-x)] pb-[var(--space-layout-page-y)]">
        <Suspense fallback={<p className="text-[var(--content-muted)]">Loading results…</p>}>
          <SearchResultsListDesktopWeb
            items={results}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={(item) => <SearchResultItemDesktopWeb {...item} />}
          />
        </Suspense>
      </section>
    </main>
  );
}
