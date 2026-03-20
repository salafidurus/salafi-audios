import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SearchResultEmpty } from "../SearchResultEmpty";

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
  if (items.length === 0) {
    return (
      <SearchResultEmpty
        shouldSearch={shouldSearch}
        isFetching={isFetching}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={item.id} style={index > 0 ? styles.itemWithSeparator : undefined}>
          {renderItem(item)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    paddingBottom: theme.spacing.layout.pageY,
  },
  itemWithSeparator: {
    marginTop: theme.spacing.component.gapSm,
  },
}));
