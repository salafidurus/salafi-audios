import type { SearchResultRow } from "@sd/domain-search";

import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SearchResultEmpty } from "../SearchResultEmpty/SearchResultEmpty";

/** Provides the native features search components SearchResultsList SearchResultsList module responsibility. */
export type { SearchResultRow };

/** Describes the SearchResultsListProps native contract and behavior. */
export type SearchResultsListProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  /** Describes the errorMessage native contract and behavior. */
  errorMessage?: string;
  renderItem: (item: SearchResultRow) => React.ReactElement | null;
};

/** Describes the SearchResultsList native contract and behavior. */
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
          {/* react-doctor-disable-next-line react-doctor/no-render-in-render */}
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
