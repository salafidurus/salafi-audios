"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native-unistyles/components/native/View";
import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";
import { StyleSheet } from "react-native-unistyles";
import { ScreenViewWeb } from "@sd/shared";
import {
  SearchFilterMobileWeb,
  type SearchFilterValue,
} from "../../components/SearchFilter/SearchFilter.mobile.web";
import {
  SearchInputMobileWeb,
  type SearchInputMobileWebRef,
} from "../../components/SearchInput/SearchInput.mobile.web";
import { SearchResultItemMobileWeb } from "../../components/SearchResultItem/SearchResultItem.mobile.web";
import {
  SearchResultsListMobileWeb,
  type SearchResultRow,
} from "../../components/SearchResultsList/SearchResultsList.mobile.web";
import { useSearchCatalog, useTopicsList } from "../../api/search.api";

export type SearchProcessingScreenProps = {
  prefill?: string;
  onBackPress?: () => void;
};

export function SearchProcessingMobileWebScreen({
  prefill,
  onBackPress,
}: SearchProcessingScreenProps) {
  const [query, setQuery] = useState(prefill || "");
  const [debouncedQuery, setDebouncedQuery] = useState(prefill || "");
  const [filter, setFilter] = useState<SearchFilterValue>([]);
  const inputRef = useRef<SearchInputMobileWebRef>(null);

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
    <ScreenViewWeb contentStyle={styles.screenContent}>
      <View style={styles.searchGroup}>
        <SearchInputMobileWeb
          ref={inputRef}
          placeholder="Search"
          value={query}
          onChange={setQuery}
          onBackPress={onBackPress}
        />
        {shouldSearch ? (
          <SearchFilterMobileWeb value={filter} onChange={setFilter} topics={topics} />
        ) : null}
      </View>
      <SearchResultsListMobileWeb
        items={items}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
        errorMessage={errorMessage}
        renderItem={(item: SearchResultRow) => (
          <SearchResultItemMobileWeb
            title={item.title}
            scholarName={item.scholarName}
            imageUrl={item.imageUrl}
            lectureCount={item.lectureCount}
            durationSeconds={item.durationSeconds}
          />
        )}
      />
    </ScreenViewWeb>
  );
}

const styles = StyleSheet.create((theme) => ({
  screenContent: {
    flex: 1,
  },
  searchGroup: {
    gap: theme.spacing.component.gapSm,
    _web: {
      paddingTop: theme.spacing.layout.pageY,
      paddingBottom: theme.spacing.component.gapMd,
    },
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
