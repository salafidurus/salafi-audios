import type { SearchResultRow } from "@sd/domain-search";

import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SearchResultEmpty } from "../SearchResultEmpty/SearchResultEmpty";

/** Implements native search input, filtering, results, and empty states. */
export type { SearchResultRow };

/** Describes the inputs and callbacks accepted by Search Results List. */
export type SearchResultsListProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  /** Renders the native error message surface and coordinates its user-facing state. */
  errorMessage?: string;
  renderItem: (item: SearchResultRow) => React.ReactElement | null;
};

/** Renders the native search results list surface and coordinates its user-facing state. */
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
