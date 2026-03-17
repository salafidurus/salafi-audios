import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type SearchResultEmptyProps = {
  shouldSearch: boolean;
  isFetching: boolean;
  errorMessage?: string;
};

export function SearchResultEmpty({
  shouldSearch,
  isFetching,
  errorMessage,
}: SearchResultEmptyProps) {
  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? "Searching..."
        : "No results found."
    : "Start typing to search.";

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  emptyState: {
    marginTop: theme.spacing.component.gapLg,
    alignItems: "center",
  },
  emptyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.content.muted,
    textAlign: "center",
  },
}));
