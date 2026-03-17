import React from "react";
import { View } from "react-native-unistyles/components/native/View";
import { ScrollView } from "react-native-unistyles/components/native/ScrollView";
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
  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.layout.pageY,
  },
  separator: {
    height: theme.spacing.component.gapSm,
  },
}));
