import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
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
    <View style={styles.resultsContainer}>
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={() => (
          <SearchResultEmpty
            shouldSearch={shouldSearch}
            isFetching={isFetching}
            errorMessage={errorMessage}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.layout.pageY,
  },
  separator: {
    height: theme.spacing.component.gapSm,
  },
}));

function ListSeparator() {
  return <View style={styles.separator} />;
}
