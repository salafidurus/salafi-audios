import type { ErrorBoundaryProps, Href } from "expo-router";

import { routes } from "@sd/core-contracts";
import { useSearchProcessing } from "@sd/domain-search";
import { useRouter, useNavigation } from "expo-router";
import { Activity, useState, useEffect, useCallback } from "react";
import { View, Text, Pressable } from "react-native";

import { ExploreRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { SearchFilter } from "@/features/search/components/SearchFilter/SearchFilter";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { SearchResultsList } from "@/features/search/components/SearchResultsList/SearchResultsList";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export function ErrorBoundary({ error: _error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Something went wrong</Text>
      <Pressable onPress={retry}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function ExploreIndexRoute() {
  const router = useRouter();
  const navigation = useNavigation();
  const { navigateToListing } = useListingNavigation();
  const showOriginal = useShowOriginalContent();

  const [searchQuery, setSearchQuery] = useState("");

  const { setQuery, filter, setFilter, topics, items, isFetching, shouldSearch, errorMessage } =
    useSearchProcessing({ prefill: "", showOriginal });

  // Sync state search query into hook query
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery, setQuery]);

  // Set the native search bar options dynamically
  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search",
        onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text),
        onCancelButtonPress: () => setSearchQuery(""),
        autoCapitalize: "none",
      },
    });
  }, [navigation]);

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
    <View style={{ flex: 1 }}>
      <Activity mode={isSearching ? "hidden" : "visible"}>
        <ExploreRecentScreen
          onNavigateToListing={navigateToListing}
          onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
        />
      </Activity>

      <Activity mode={isSearching ? "visible" : "hidden"}>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {shouldSearch ? (
            <View style={{ marginVertical: 8 }}>
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
