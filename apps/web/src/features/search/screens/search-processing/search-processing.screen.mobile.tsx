"use client";

import { useEffect, useRef } from "react";
import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";
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
import styles from "./search-processing.screen.mobile.module.css";

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
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.searchGroup}>
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
      </div>
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
