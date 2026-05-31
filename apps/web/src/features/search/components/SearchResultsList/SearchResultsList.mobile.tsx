import { type CSSProperties } from "react";
import React from "react";
import { SearchResultEmptyMobile } from "../SearchResultEmpty/SearchResultEmpty.mobile";
import { useDragScroll } from "@/shared/hooks/use-drag-scroll";
import styles from "./SearchResultsList.mobile.module.css";

export type SearchResultRow = {
  id: string;
  title: string;
  scholarName: string;
  imageUrl?: string;
  lectureCount: number;
  durationSeconds?: number;
};

export type SearchResultsListProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  errorMessage?: string;
  renderItem: (item: SearchResultRow) => React.ReactElement | null;
};

export type SearchResultsListMobileProps = SearchResultsListProps;

type ItemRendererProps = {
  item: SearchResultRow;
  renderItem: (item: SearchResultRow) => React.ReactElement | null;
};

function ItemRenderer({ item, renderItem }: ItemRendererProps) {
  return renderItem(item);
}

export function SearchResultsListMobile({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
  renderItem,
}: SearchResultsListMobileProps) {
  const scrollRef = useDragScroll("vertical");

  return (
    <div
      ref={scrollRef}
      style={
        {
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          cursor: "grab",
        } satisfies CSSProperties
      }
    >
      <div className={styles.inner}>
        {items.length === 0 ? (
          <SearchResultEmptyMobile
            shouldSearch={shouldSearch}
            isFetching={isFetching}
            errorMessage={errorMessage}
          />
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <div className={styles.separator} />}
              <ItemRenderer item={item} renderItem={renderItem} />
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
