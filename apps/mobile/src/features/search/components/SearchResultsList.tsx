import { View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet } from "react-native-unistyles";
import { SearchResultItem } from "./SearchResultItem";
import { SearchResultEmpty } from "./SearchResultEmpty";

export type SearchResultRow = {
  id: string;
  title: string;
  scholarName: string;
  imageUrl?: string;
  lectureCount: number;
  durationSeconds?: number;
};

type SearchResultsListProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  errorMessage?: string;
};

export function SearchResultsList({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
}: SearchResultsListProps) {
  return (
    <View style={styles.resultsContainer}>
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SearchResultItem
            title={item.title}
            scholarName={item.scholarName}
            imageUrl={item.imageUrl}
            lectureCount={item.lectureCount}
            durationSeconds={item.durationSeconds}
          />
        )}
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
    // marginTop: theme.spacing.component.gapLg,
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
