import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet } from "react-native-unistyles";
import { SearchResultItem, type SearchResultKind } from "./SearchResultItem";
import { SearchResultEmpty } from "./SearchResultEmpty";

export type SearchResultRow = {
  id: string;
  kind: SearchResultKind;
  title: string;
  description?: string;
};

type SearchResultsListProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function SearchResultsList({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
  onRefresh,
  isRefreshing,
}: SearchResultsListProps) {
  return (
    <View style={styles.resultsContainer}>
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SearchResultItem kind={item.kind} title={item.title} description={item.description} />
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={isRefreshing ?? false}
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
    // marginTop: theme.spacing.component.gapLg,
  },
  listContent: {
    gap: theme.spacing.component.gapMd,
    paddingBottom: theme.spacing.layout.pageY,
  },
}));
