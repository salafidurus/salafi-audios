"use client";

import { useEffect, useRef } from "react";
import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";
import { StyleSheet } from "react-native-unistyles";
import { View } from "react-native-unistyles/components/native/View";
import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { SearchFilterMobile } from "../../components/SearchFilter/SearchFilter.mobile";
import {
  SearchInputMobile,
  type SearchInputMobileRef,
} from "../../components/SearchInput/SearchInput.mobile";
import { SearchResultItemMobile } from "../../components/SearchResultItem/SearchResultItem.mobile";
import {
  SearchResultsListMobile,
  type SearchResultRow,
} from "../../components/SearchResultsList/SearchResultsList.mobile";
import { useSearchProcessing } from "@sd/domain-search";

export type SearchProcessingScreenProps = {
  prefill?: string;
  onBackPress?: () => void;
};

export function SearchProcessingMobileScreen({
  prefill,
  onBackPress,
}: SearchProcessingScreenProps) {
  const inputRef = useRef<SearchInputMobileRef>(null);
  const {
    query,
    setQuery,
    filter,
    setFilter,
    topics,
    items,
    isFetching,
    shouldSearch,
    errorMessage,
  } = useSearchProcessing({ prefill });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ScreenView contentStyle={styles.screenContent}>
      <View style={styles.searchGroup}>
        <SearchInputMobile
          ref={inputRef}
          placeholder="Search"
          value={query}
          onChange={setQuery}
          onBackPress={onBackPress}
        />
        {shouldSearch ? (
          <SearchFilterMobile value={filter} onChange={setFilter} topics={topics} />
        ) : null}
      </View>
      <SearchResultsListMobile
        items={items}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
        errorMessage={errorMessage}
        renderItem={(item: SearchResultRow) => (
          <SearchResultItemMobile
            title={item.title}
            scholarName={item.scholarName}
            imageUrl={item.imageUrl}
            lectureCount={item.lectureCount}
            durationSeconds={item.durationSeconds}
          />
        )}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screenContent: {
    flex: 1,
  },
  searchGroup: {
    gap: theme.spacing.component.gapSm,
    _web: {
      position: "sticky" as const,
      top: 0,
      zIndex: 10,
      paddingTop: theme.spacing.layout.pageY,
      paddingBottom: theme.spacing.component.gapMd,
      background: "color-mix(in srgb, var(--surface-canvas) 80%, transparent)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    },
  },
}));
