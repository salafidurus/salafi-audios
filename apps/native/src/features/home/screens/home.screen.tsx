import type { Href } from "expo-router";

import { routes } from "@sd/core-contracts";
import { useSearchProcessing } from "@sd/domain-search";
import { useRouter, useNavigation } from "expo-router";
import { Activity, useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { ExploreRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { SearchFilter } from "@/features/search/components/SearchFilter/SearchFilter";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { SearchResultsList } from "@/features/search/components/SearchResultsList/SearchResultsList";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export type HomeScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

export function HomeScreen({ onNavigateToListing, onNavigateToScholar }: HomeScreenProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useUnistyles();
  const { navigateToListing } = useListingNavigation();
  const showOriginal = useShowOriginalContent();

  const [searchQuery, setSearchQuery] = useState("");

  const { setQuery, filter, setFilter, topics, items, isFetching, shouldSearch, errorMessage } =
    useSearchProcessing({ prefill: "", showOriginal });

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery, setQuery]);

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text),
        onCancelButtonPress: () => setSearchQuery(""),
        autoCapitalize: "none",
        ...getThemedSearchBarOptions(theme),
      },
    });
  }, [navigation, theme]);

  const isSearching = searchQuery.trim().length > 0;

  const renderSearchResultItem = useCallback(
    (item: any) => (
      <SearchResultItem
        title={item.title}
        scholarName={item.scholarName}
        imageUrl={item.imageUrl}
        lectureCount={item.lectureCount}
        durationSeconds={item.durationSeconds}
        onPress={() => navigateToListing(item.slug)}
      />
    ),
    [navigateToListing],
  );

  return (
    <View style={styles.screen}>
      <Activity mode={isSearching ? "hidden" : "visible"}>
        {/* Stage 6: hero / scholars / chips / recently added replace this placeholder content */}
        <ExploreRecentScreen
          onNavigateToListing={onNavigateToListing ?? navigateToListing}
          onNavigateToScholar={
            onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug) as Href))
          }
        />
      </Activity>

      <Activity mode={isSearching ? "visible" : "hidden"}>
        <View style={styles.searchResults}>
          {shouldSearch ? (
            <View style={styles.searchFilter}>
              <SearchFilter value={filter} onChange={setFilter} topics={topics} />
            </View>
          ) : null}
          <SearchResultsList
            items={items}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={renderSearchResultItem}
          />
        </View>
      </Activity>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface.canvas,
  },
  searchFilter: {
    marginVertical: 8,
  },
}));
