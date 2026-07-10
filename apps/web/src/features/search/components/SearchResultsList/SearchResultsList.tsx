"use client";

import React from "react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { useDragScroll } from "@/shared/hooks/use-drag-scroll";
import { List } from "@/shared/components/List";
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

  if (shouldShowEmpty) {
    return (
      <List>
        <SearchResultEmpty
          shouldSearch={shouldSearch}
          isFetching={isFetching}
          errorMessage={errorMessage}
        />
      </List>
    );
  }

  return (
    <div
      ref={isDesktop ? undefined : scrollRef}
      className={isDesktop ? styles.desktopContainer : styles.mobileContainer}
    >
      <List>
        {items.map((item) => (
          <List.Item key={item.id}>{renderItem(item)}</List.Item>
        ))}
      </List>
    </div>
  );
}
