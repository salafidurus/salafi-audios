"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { Search } from "@/shared/components/Search";
import { Button } from "@/shared/components/Button/Button";
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

  // Transform topics into chips format for Search.Filter
  const filterChips = useMemo(() => {
    return topics
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map((topic) => ({
        id: topic.slug,
        label: topic.name,
      }));
  }, [topics]);

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
            <Search.Bar
              placeholder={t("search.placeholder", "Search")}
              value={query}
              onChange={setQuery}
            />
            <Search.Filter
              chips={filterChips}
              selected={filter}
              onChipChange={(chipId: string) => {
                setFilter(
                  filter.includes(chipId)
                    ? filter.filter((f) => f !== chipId)
                    : [...filter, chipId],
                );
              }}
              multiple
            />
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
        <div className="flex items-center gap-[var(--space-component-gap-sm)]">
          <Button
            variant="ghost"
            size="icon"
            icon={<ChevronLeft size={20} />}
            onClick={onBackPress}
            aria-label="Go back"
          />
          <Search.Bar
            placeholder={t("search.placeholder", "Search")}
            value={query}
            onChange={setQuery}
            className="flex-1"
          />
        </div>
        {shouldSearch ? (
          <Search.Filter
            chips={filterChips}
            selected={filter}
            onChipChange={(chipId: string) => {
              setFilter(
                filter.includes(chipId) ? filter.filter((f) => f !== chipId) : [...filter, chipId],
              );
            }}
            multiple
          />
        ) : null}
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
