import { type CSSProperties } from "react";
import React from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SearchResultEmpty } from "../SearchResultEmpty";
import { useDragScroll } from "@sd/shared";

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

export function SearchResultsList({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
  renderItem,
}: SearchResultsListProps) {
  const { theme } = useUnistyles();
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
      <div style={{ paddingBottom: theme.spacing.layout.pageY }}>
        {items.length === 0 ? (
          <SearchResultEmpty
            shouldSearch={shouldSearch}
            isFetching={isFetching}
            errorMessage={errorMessage}
          />
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.separator} />}
              {renderItem(item)}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}

const styles = StyleSheet.create((theme) => ({
  separator: {
    _web: {
      height: theme.spacing.component.gapSm,
    },
  },
}));
