"use client";

import { useEffect, useRef } from "react";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { SearchFilterMobile } from "@/features/search/components/SearchFilter/SearchFilter.mobile";
import {
  SearchInputMobile,
  type SearchInputMobileRef,
} from "@/features/search/components/SearchInput/SearchInput.mobile";
import { SearchResultItemMobile } from "@/features/search/components/SearchResultItem/SearchResultItem.mobile";
import {
  SearchResultsListMobile,
  type SearchResultRow,
} from "@/features/search/components/SearchResultsList/SearchResultsList.mobile";
import { useSearchProcessing } from "@sd/domain-search";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
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
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
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
  } = useSearchProcessing({ prefill, showOriginal });
  const { push } = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleItemPress = (item: SearchResultRow) => {
    const [kind, id] = item.id.split(":");
    if (!id) return;
    if (kind === "collection") {
      push(routes.collections.detail(id));
    } else if (kind === "series") {
      push(routes.series.detail(id));
    } else if (kind === "single") {
      push(routes.lectures.detail(id));
    }
  };

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.searchGroup}>
        <SearchInputMobile
          ref={inputRef}
          placeholder={t("search.placeholder", "Search")}
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
            onPress={() => handleItemPress(item)}
          />
        )}
      />
    </ScreenView>
  );
}
