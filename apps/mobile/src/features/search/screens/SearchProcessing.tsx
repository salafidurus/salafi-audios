import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchResultRow } from "../components/SearchResultsList";
import { SearchInput, type SearchInputRef } from "../components/SearchInput";
import { ScreenView } from "@/shared/components/ScreenView";
import { SearchResultsList } from "../components/SearchResultsList";
import { type SearchFilterValue } from "../components/SearchFilter";
import { useSearchCatalog } from "../api/search.api";
import type {
  CollectionViewDto,
  LectureViewDto,
  SearchCatalogResultsDto,
  SeriesViewDto,
} from "@sd/contracts";

export type SearchProcessingProps = {
  prefill?: string;
};

export function SearchProcessing({ prefill }: SearchProcessingProps) {
  const [query, setQuery] = useState(prefill || "");
  const [debouncedQuery, setDebouncedQuery] = useState(prefill || "");
  const [filter, setFilter] = useState<SearchFilterValue>("all");
  const inputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const shouldSearch = debouncedQuery.length > 0;
  const { data, isFetching } = useSearchCatalog(
    { q: debouncedQuery, limit: 20 },
    { enabled: shouldSearch },
  );

  const items = useMemo(() => {
    return buildResultItems(data, filter);
  }, [data, filter]);

  return (
    <ScreenView>
      <SearchInput ref={inputRef} placeholder="Search" value={query} onChange={setQuery} />
      <SearchResultsList
        items={items}
        filter={filter}
        onFilterChange={setFilter}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
      />
    </ScreenView>
  );
}

function buildResultItems(
  data: SearchCatalogResultsDto | undefined,
  filter: SearchFilterValue,
): SearchResultRow[] {
  if (!data) return [];

  const collections = data.collections.map((item: CollectionViewDto) => ({
    id: `collection:${item.id}`,
    kind: "collection" as const,
    title: item.title,
    description: item.description,
  }));

  const series = data.series.map((item: SeriesViewDto) => ({
    id: `series:${item.id}`,
    kind: "series" as const,
    title: item.title,
    description: item.description,
  }));

  const lectures = data.lectures.map((item: LectureViewDto) => ({
    id: `lecture:${item.id}`,
    kind: "lecture" as const,
    title: item.title,
    description: item.description,
  }));

  if (filter === "collections") return collections;
  if (filter === "series") return series;
  if (filter === "lectures") return lectures;

  return [...collections, ...series, ...lectures];
}
