import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet } from "react-native-unistyles";
import { SearchFilter, type SearchFilterValue } from "./SearchFilter";
import { SearchResultItem, type SearchResultKind } from "./SearchResultItem";

export type SearchResultRow = {
  id: string;
  kind: SearchResultKind;
  title: string;
  description?: string;
};

type SearchResultsListProps = {
  items: SearchResultRow[];
  filter: SearchFilterValue;
  onFilterChange: (value: SearchFilterValue) => void;
  isFetching: boolean;
  shouldSearch: boolean;
};

export function SearchResultsList({
  items,
  filter,
  onFilterChange,
  isFetching,
  shouldSearch,
}: SearchResultsListProps) {
  return (
    <View style={styles.resultsContainer}>
      {shouldSearch ? <SearchFilter value={filter} onChange={onFilterChange} /> : null}
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SearchResultItem kind={item.kind} title={item.title} description={item.description} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          shouldSearch
            ? () => (
                <Text style={styles.emptyText}>
                  {isFetching ? "Searching..." : "No results found."}
                </Text>
              )
            : () => <Text style={styles.emptyText}>Start typing to search.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  resultsContainer: {
    flex: 1,
    marginTop: theme.spacing.component.gapLg,
  },
  listContent: {
    gap: theme.spacing.component.gapMd,
    paddingBottom: theme.spacing.layout.pageY,
  },
  emptyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.content.muted,
    textAlign: "center",
    marginTop: theme.spacing.component.gapLg,
  },
}));
