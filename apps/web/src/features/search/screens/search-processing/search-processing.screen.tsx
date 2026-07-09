"use client";

import { useEffect, useRef } from "react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { SearchFilterDesktop } from "@/features/search/components/SearchFilter/SearchFilter.desktop";
import { SearchInputDesktop } from "@/features/search/components/SearchInput/SearchInput.desktop";
import { SearchFilterMobile } from "@/features/search/components/SearchFilter/SearchFilter.mobile";
import {
  SearchInputMobile,
  type SearchInputMobileRef,
} from "@/features/search/components/SearchInput/SearchInput.mobile";
import { SearchResultItemDesktop } from "@/features/search/components/SearchResultItem/SearchResultItem.desktop";
import { SearchResultItemMobile } from "@/features/search/components/SearchResultItem/SearchResultItem.mobile";
import { SearchResultsListDesktop } from "@/features/search/components/SearchResultsList/SearchResultsList.desktop";
import {
  SearchResultsListMobile,
  type SearchResultRow,
} from "@/features/search/components/SearchResultsList/SearchResultsList.mobile";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useSearchProcessing } from "@sd/domain-search";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import styles from "./search-processing.screen.module.css";

export type SearchProcessingScreenProps = {
  searchKey?: string;
  onBackPress?: () => void;
};

export function SearchProcessingScreen({ searchKey, onBackPress }: SearchProcessingScreenProps) {
  const isDesktop = useIsDesktop();
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<SearchInputMobileRef>(null);
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
  } = useSearchProcessing({ prefill: searchKey, showOriginal });
  const { push } = useRouter();

  useEffect(() => {
    if (isDesktop) {
      desktopInputRef.current?.focus();
    } else {
      mobileInputRef.current?.focus();
    }
  }, [isDesktop]);

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

  if (isDesktop) {
    return (
      <ScreenView>
        <div
          className={styles.stickyHeader}
          style={{
            background: "color-mix(in srgb, var(--surface-canvas) 80%, transparent)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="flex flex-col gap-[var(--space-component-gap-md)]">
            <SearchInputDesktop
              ref={desktopInputRef}
              placeholder={t("search.placeholder", "Search")}
              value={query}
              onChange={setQuery}
              autoFocus
            />
            <SearchFilterDesktop value={filter} onChange={setFilter} topics={topics} />
          </div>
        </div>
        <section className="pb-[var(--space-layout-page-y)]">
          <SearchResultsListDesktop
            items={items}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={(item) => (
              <SearchResultItemDesktop {...item} onClick={() => handleItemPress(item)} />
            )}
          />
        </section>
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.searchGroup}>
        <SearchInputMobile
          ref={mobileInputRef}
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
