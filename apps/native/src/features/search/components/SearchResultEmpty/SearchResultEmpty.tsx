import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

/** Implements native search input, filtering, results, and empty states. */
/** Describes the inputs and callbacks accepted by Search Result Empty. */
export type SearchResultEmptyProps = {
  shouldSearch: boolean;
  isFetching: boolean;
  /** Renders the native error message surface and coordinates its user-facing state. */
  errorMessage?: string;
};

/** Renders the native search result empty surface and coordinates its user-facing state. */
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

  const variant = errorMessage ? "error" : isFetching ? "loading" : "empty";

  return (
    <View style={styles.container}>
      <EmptyState message={message} variant={variant} />
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
