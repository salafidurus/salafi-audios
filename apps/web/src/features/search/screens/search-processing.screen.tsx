"use client";

import { Suspense, useMemo, useState } from "react";
import { SearchProcessingScreen as MobileSearchProcessingScreen } from "@sd/ui-mobile";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/features/search/components/search-input";
import { SearchFilter } from "@/features/search/components/search-filter";
import { SearchResults } from "@/features/search/components/search-results";
import { Activity } from "@/shared/components/activity/activity";
import { useResponsive } from "@/shared/hooks/use-responsive";
import {
  type SearchCatalogResultsDto,
  type SearchCatalogItemDto,
  type SearchCatalogParams,
  type TopicDetailDto,
  queryKeys,
  endpoints,
} from "@sd/contracts";
import { useApiQuery } from "@sd/contracts/query/hooks";
import { httpClient } from "@sd/contracts/http";

type SearchResultRow = SearchCatalogItemDto & { group: string };

export function SearchProcessingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    const prefill = searchParams.get("searchKey") ?? undefined;
    return (
      <MobileSearchProcessingScreen
        prefill={prefill}
        onBackPress={() => {
          router.back();
        }}
      />
    );
  }

  return <DesktopSearchProcessingScreen />;
}

function DesktopSearchProcessingScreen() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

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

  const results = useMemo(() => buildResultItems(data), [data]);

  return (
    <main className="flex flex-1 flex-col gap-[var(--space-layout-section-y)] px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="mx-auto flex w-full max-w-[52rem] flex-col gap-[var(--space-component-gap-md)]">
        <SearchInput placeholder="Search" value={query} onChange={setQuery} autoFocus />
        <SearchFilter
          topics={topics ?? []}
          active={filters}
          onToggle={(slug) =>
            setFilters((prev) =>
              prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
            )
          }
        />
      </section>
      <section className="mx-auto w-full max-w-[70rem]">
        <Suspense fallback={<Activity label="Loading results" />}>
          <SearchResults
            results={results}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            error={error}
          />
        </Suspense>
      </section>
    </main>
  );
}

function buildResultItems(data: SearchCatalogResultsDto | undefined): SearchResultRow[] {
  if (!data) return [];
  const collections = data.collections.map((item) => ({ ...item, group: "Collection" }));
  const series = data.series.map((item) => ({ ...item, group: "Series" }));
  const lectures = data.lectures.map((item) => ({ ...item, group: "Lecture" }));
  return [...collections, ...series, ...lectures];
}
