import { AlertCircle, Search, SearchX } from "lucide-react-native";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

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
  const { theme } = useUnistyles();
  const gold = theme.colors.action.primary;

  if (!shouldSearch) {
    return (
      <View style={styles.container}>
        <EmptyState
          message={t("search.startTyping", "Start typing to search.")}
          icon={<Search size={24} color={gold} />}
        />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <EmptyState
          message={errorMessage}
          variant="error"
          icon={<AlertCircle size={24} color={theme.colors.state.dangerContent} />}
        />
      </View>
    );
  }

  if (isFetching) {
    return (
      <View style={styles.container}>
        <EmptyState
          message={t("search.searching", "Searching…")}
          variant="loading"
          icon={<Search size={24} color={gold} />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmptyState
        message={t("search.noResults", "No results found.")}
        description={t("search.noResultsDesc", "Try a different search term or browse by scholar.")}
        icon={<SearchX size={24} color={gold} />}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.spacing.scale["3xl"],
    alignItems: "center",
  },
}));
