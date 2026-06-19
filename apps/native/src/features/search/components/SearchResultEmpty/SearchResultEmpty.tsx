import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";

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
  const { t } = useTranslation();
  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? t("search.searching", "Searching…")
        : t("search.noResults", "No results found.")
    : t("search.startTyping", "Start typing to search.");

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.spacing.scale["3xl"],
    alignItems: "center",
  },
  message: {
    color: theme.colors.content.muted,
    textAlign: "center",
    ...theme.typography.bodyMd,
  },
}));
