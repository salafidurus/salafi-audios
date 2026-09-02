import { useSearchProcessing } from "@sd/domain-search";
import { useCallback } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppText, NativeFormField, ScreenView } from "@/shared/ui";

import { SearchFilter } from "../components/SearchFilter/SearchFilter";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import {
  SearchResultsList,
  type SearchResultRow,
} from "../components/SearchResultsList/SearchResultsList";

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

function PopularSearches({
  onSelect,
  t,
}: {
  onSelect: (query: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const searches = [
    t("search.popularTafsir", "Tafsir"),
    t("search.popularFiqh", "Fiqh of Worship"),
    t("search.popularAqeedah", "Nullifiers of Islam"),
    t("search.popularNahw", "Nahw"),
  ];

  return (
    <View style={styles.popular}>
      <AppText variant="titleMd">{t("search.popularSearches", "POPULAR SEARCHES")}</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularList}
      >
        {searches.map((search) => (
          <Pressable key={search} onPress={() => onSelect(search)} style={styles.popularChip}>
            <AppText variant="bodySm" colorRole="default">
              {search}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/** Renders debounced catalog search, topic filters, and navigable result rows. */
export function SearchScreen({ onNavigateToListing }: SearchScreenProps) {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();
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
  } = useSearchProcessing({ showOriginal });
  const handleListingPress = useCallback(
    (slug: string) => onNavigateToListing?.(slug),
    [onNavigateToListing],
  );
  const renderSearchResult = useCallback(
    (item: SearchResultRow) => (
      <SearchResultItem
        title={item.title}
        scholarName={item.scholarName}
        imageUrl={item.imageUrl}
        lectureCount={item.lectureCount}
        durationSeconds={item.durationSeconds}
        listingSlug={item.slug}
        onNavigateToListing={handleListingPress}
      />
    ),
    [handleListingPress],
  );

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <NativeFormField
          label={t("search.label", "Search")}
          value={query}
          onChangeText={setQuery}
          placeholder={t("search.placeholder", "Search lectures, scholars, or topics")}
          testID="native-global-search-input"
        />
        <View style={styles.intro}>
          <AppText variant="bodySm" colorRole="muted">
            {t("search.description", "Search lectures, scholars, and topics across the catalog.")}
          </AppText>
        </View>
        <SearchFilter value={filter} onChange={setFilter} topics={topics} />
        <View style={styles.results}>
          {shouldSearch ? (
            <SearchResultsList
              items={items}
              isFetching={isFetching}
              shouldSearch={shouldSearch}
              errorMessage={errorMessage}
              renderItem={renderSearchResult}
            />
          ) : (
            <PopularSearches onSelect={setQuery} t={t} />
          )}
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
  intro: {
    gap: theme.spacing.scale.xs,
    paddingTop: theme.spacing.scale.xs,
  },
  popular: {
    gap: theme.spacing.scale.sm,
    paddingTop: theme.spacing.scale.md,
  },
  popularList: {
    gap: theme.spacing.component.gapSm,
    paddingBottom: theme.spacing.scale.md,
  },
  popularChip: {
    minHeight: theme.spacing.scale["4xl"],
    paddingHorizontal: theme.spacing.scale.md,
    justifyContent: "center",
    borderRadius: theme.radius.component.chip,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.default,
  },
}));
