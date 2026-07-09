"use client";

import React from "react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { useDragScroll } from "@/shared/hooks/use-drag-scroll";
import { SearchResultEmpty } from "../SearchResultEmpty/SearchResultEmpty";
import styles from "./SearchResultsList.module.css";

export type { SearchResultRow } from "@sd/domain-search";

export type SearchResultsListProps = {
  items: import("@sd/domain-search").SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  errorMessage?: string;
  renderItem: (item: import("@sd/domain-search").SearchResultRow) => React.ReactElement | null;
};

export function SearchResultsList({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
  renderItem,
}: SearchResultsListProps) {
  const isDesktop = useIsDesktop();
  const scrollRef = useDragScroll("vertical");
  const shouldShowEmpty = items.length === 0 || Boolean(errorMessage);

  if (isDesktop) {
    return (
      <div className={styles.list}>
        {shouldShowEmpty ? (
          <SearchResultEmpty
            shouldSearch={shouldSearch}
            isFetching={isFetching}
            errorMessage={errorMessage}
          />
        ) : null}
        <div className={styles.items}>
          {items.map((item) => (
            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={styles.scrollContainer}>
      <div className={styles.inner}>
        {shouldShowEmpty ? (
          <SearchResultEmpty
            shouldSearch={shouldSearch}
            isFetching={isFetching}
            errorMessage={errorMessage}
          />
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <div className={styles.separator} />}
              {renderItem(item)}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
