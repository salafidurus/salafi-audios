import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { SearchResultRow } from "../components/SearchResultsList";
import { SearchInput, type SearchInputRef } from "../components/SearchInput";
import { ScreenView } from "@/shared/components/ScreenView";
import { SearchResultsList } from "../components/SearchResultsList";
import { SearchFilter, type SearchFilterValue } from "../components/SearchFilter";
import { useSearchCatalog, useTopicsList } from "../api/search.api";
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
  const [filter, setFilter] = useState<SearchFilterValue>([]);
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
  const { data, isFetching, error, refetch } = useSearchCatalog(
    {
      q: debouncedQuery,
      limit: 20,
      topicSlugs: filter.length ? filter : undefined,
    },
    { enabled: shouldSearch },
  );
  const { data: topics = [] } = useTopicsList();

  const items = useMemo(() => {
    return buildResultItems(data);
  }, [data]);

  const errorMessage = useMemo(() => {
    if (!error) return undefined;
    if (error instanceof Error) return error.message;
    return "Unable to reach the server.";
  }, [error]);

  return (
    <ScreenView>
      <View style={styles.searchGroup}>
        <SearchInput ref={inputRef} placeholder="Search" value={query} onChange={setQuery} />
        {shouldSearch ? <SearchFilter value={filter} onChange={setFilter} topics={topics} /> : null}
      </View>
      <SearchResultsList
        items={items}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
        errorMessage={errorMessage}
        onRefresh={shouldSearch ? refetch : undefined}
        isRefreshing={isFetching}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchGroup: {
    gap: theme.spacing.component.gapSm,
  },
}));

function buildResultItems(data: SearchCatalogResultsDto | undefined): SearchResultRow[] {
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

  return [...collections, ...series, ...lectures];
}
