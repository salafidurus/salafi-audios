import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Text } from "react-native-unistyles/components/native/Text";
import { View } from "react-native-unistyles/components/native/View";

export type SearchResultEmptyMobileWebProps = {
  shouldSearch: boolean;
  isFetching: boolean;
  errorMessage?: string;
};

export function SearchResultEmptyMobileWeb({
  shouldSearch,
  isFetching,
  errorMessage,
}: SearchResultEmptyMobileWebProps) {
  const { theme } = useUnistyles();

  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? "Searching..."
        : "No results found."
    : "Start typing to search.";

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.subtle,
    _web: {
      marginTop: theme.spacing.scale["3xl"],
      paddingHorizontal: theme.spacing.component.cardPadding,
      paddingVertical: theme.spacing.scale["3xl"],
    },
  },
  message: {
    color: theme.colors.content.muted,
    textAlign: "center",
    _web: {
      ...theme.typography.bodyMd,
      lineHeight: String(theme.typography.bodyMd.lineHeight),
    },
  },
}));
