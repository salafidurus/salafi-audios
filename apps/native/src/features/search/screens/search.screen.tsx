import { useSearchProcessing } from "@sd/domain-search";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeFormField, ScreenView } from "@/shared/ui";

import { SearchFilter } from "../components/SearchFilter/SearchFilter";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import { SearchResultsList } from "../components/SearchResultsList/SearchResultsList";

/**
 * Provides the pushed global Search screen for public catalog discovery.
 */
/**
 * Carries the listing navigation boundary for search results.
 * The screen owns query/filter state, while route composition owns how a
 * selected listing is presented so search remains reusable in native roots.
 */
export type SearchScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

/** Renders debounced catalog search, topic filters, and navigable result rows. */
export function SearchScreen({ onNavigateToListing }: SearchScreenProps) {
  const { t } = useTranslation();
  const {
    query,
    setQuery,
    filter,
    setFilter,
    topics,
    items,
    isFetching,
    shouldSearch,
    errorMessage,
  } = useSearchProcessing();

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <NativeFormField
          label={t("search.label", "Search")}
          value={query}
          onChangeText={setQuery}
          placeholder={t("search.placeholder", "Search lectures, series, and scholars")}
          testID="native-global-search-input"
        />
        <SearchFilter value={filter} onChange={setFilter} topics={topics} />
        <View style={styles.results}>
          <SearchResultsList
            items={items}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={(item) => (
              <SearchResultItem
                title={item.title}
                scholarName={item.scholarName}
                imageUrl={item.imageUrl}
                lectureCount={item.lectureCount}
                durationSeconds={item.durationSeconds}
                onPress={() => onNavigateToListing?.(item.slug)}
              />
            )}
          />
        </View>
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.scale.md,
    paddingBottom: theme.spacing.layout.pageY,
  },
  results: {
    flex: 1,
  },
}));
