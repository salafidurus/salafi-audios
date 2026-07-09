"use client";

import { useEffect, useRef } from "react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { SearchFilter } from "@/features/search/components/SearchFilter/SearchFilter";
import {
  SearchInput,
  type SearchInputRef,
} from "@/features/search/components/SearchInput/SearchInput";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { SearchResultsList } from "@/features/search/components/SearchResultsList/SearchResultsList";
import type { SearchResultRow } from "@sd/domain-search";
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
  const inputRef = useRef<SearchInputRef>(null);
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
            <SearchInput
              ref={inputRef}
              placeholder={t("search.placeholder", "Search")}
              value={query}
              onChange={setQuery}
              autoFocus
            />
            <SearchFilter value={filter} onChange={setFilter} topics={topics} />
          </div>
        </div>
        <section className="pb-[var(--space-layout-page-y)]">
          <SearchResultsList
            items={items}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={(item) => (
              <SearchResultItem item={item} onPress={() => handleItemPress(item)} />
            )}
          />
        </section>
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.searchGroup}>
        <SearchInput
          ref={inputRef}
          placeholder={t("search.placeholder", "Search")}
          value={query}
          onChange={setQuery}
          onBackPress={onBackPress}
        />
        {shouldSearch ? <SearchFilter value={filter} onChange={setFilter} topics={topics} /> : null}
      </div>
      <SearchResultsList
        items={items}
        isFetching={isFetching}
        shouldSearch={shouldSearch}
        errorMessage={errorMessage}
        renderItem={(item: SearchResultRow) => (
          <SearchResultItem item={item} onPress={() => handleItemPress(item)} />
        )}
      />
    </ScreenView>
  );
}
