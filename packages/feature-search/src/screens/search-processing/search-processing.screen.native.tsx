import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";
import { StyleSheet } from "react-native-unistyles";
import {
  SearchFilterMobileNative,
  type SearchFilterValue,
} from "../../components/SearchFilter/SearchFilter.native";
import { SearchInput, type SearchInputRef } from "../../components/SearchInput/SearchInput.native";
import { SearchResultItemMobileNative } from "../../components/SearchResultItem/SearchResultItem.native";
import {
  SearchResultsListMobileNative,
  type SearchResultRow,
} from "../../components/SearchResultsList/SearchResultsList.native";
import { useSearchCatalog, useTopicsList } from "../../api/search.api";
import { ScreenViewMobileNative } from "@sd/shared";

export type SearchProcessingScreenProps = {
  prefill?: string;
  onBackPress?: () => void;
};

export function SearchProcessingMobileNativeScreen({
  prefill,
  onBackPress,
}: SearchProcessingScreenProps) {
  const [query, setQuery] = useState(prefill || "");
  const [debouncedQuery, setDebouncedQuery] = useState(prefill || "");
  const [filter, setFilter] = useState<SearchFilterValue>([]);
  const inputRef = useRef<SearchInputRef>(null);

  useEffect(() => {
    setQuery(prefill || "");
    setDebouncedQuery(prefill || "");
  }, [prefill]);

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
  const { data, isFetching, error } = useSearchCatalog(
    {
      q: debouncedQuery,
      limit: 20,
      topicSlugs: filter.length ? filter : undefined,
    },
    { enabled: shouldSearch },
  );
  const { data: topics = [] } = useTopicsList();

  const items = useMemo(() => buildResultItems(data), [data]);

  const errorMessage = useMemo(() => {
    if (!error) {
      return undefined;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Unable to reach the server.";
  }, [error]);

  return (
    <ScreenViewMobileNative backgroundVariant="primaryWash">
      <View style={styles.searchGroup}>
        <SearchInput
          ref={inputRef}
          placeholder="Search"
          value={query}
          onChange={setQuery}
          onBackPress={onBackPress}
        />
        {shouldSearch ? (
          <SearchFilterMobileNative value={filter} onChange={setFilter} topics={topics} />
        ) : null}
      </View>
      <SearchResultsListMobileNative
        items={items}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
        errorMessage={errorMessage}
        renderItem={(item: SearchResultRow) => (
          <SearchResultItemMobileNative
            title={item.title}
            scholarName={item.scholarName}
            imageUrl={item.imageUrl}
            lectureCount={item.lectureCount}
            durationSeconds={item.durationSeconds}
          />
        )}
      />
    </ScreenViewMobileNative>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchGroup: {
    gap: theme.spacing.component.gapSm,
  },
}));

function buildResultItems(data: SearchCatalogResultsDto | undefined): SearchResultRow[] {
  if (!data) {
    return [];
  }

  const collections = data.collections.map((item: SearchCatalogItemDto) => ({
    id: `collection:${item.id}`,
    title: item.title,
    scholarName: item.scholarName,
    imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
    lectureCount: item.lectureCount,
    durationSeconds: item.durationSeconds,
  }));

  const series = data.series.map((item: SearchCatalogItemDto) => ({
    id: `series:${item.id}`,
    title: item.title,
    scholarName: item.scholarName,
    imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
    lectureCount: item.lectureCount,
    durationSeconds: item.durationSeconds,
  }));

  const lectures = data.lectures.map((item: SearchCatalogItemDto) => ({
    id: `lecture:${item.id}`,
    title: item.title,
    scholarName: item.scholarName,
    imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
    lectureCount: item.lectureCount,
    durationSeconds: item.durationSeconds,
  }));

  return [...collections, ...series, ...lectures];
}
