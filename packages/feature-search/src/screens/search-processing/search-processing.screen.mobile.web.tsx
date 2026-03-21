"use client";

import { useEffect, useRef } from "react";
import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";
import { StyleSheet } from "react-native-unistyles";
import { View } from "react-native-unistyles/components/native/View";
import { ScreenViewWeb } from "@sd/shared";
import {
  SearchFilterMobileWeb,
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
import { useSearchProcessing } from "../../hooks/use-search-processing";

export type SearchProcessingScreenProps = {
  prefill?: string;
  onBackPress?: () => void;
};

export function SearchProcessingMobileWebScreen({
  prefill,
  onBackPress,
}: SearchProcessingScreenProps) {
  const inputRef = useRef<SearchInputMobileWebRef>(null);
  const { query, setQuery, filter, setFilter, topics, items, isFetching, shouldSearch, errorMessage } =
    useSearchProcessing({ prefill });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
