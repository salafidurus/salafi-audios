import type { ErrorBoundaryProps, Href } from "expo-router";

import { Column, ScrollView } from "@expo/ui";
import { routes } from "@sd/core-contracts";
import { useSearchProcessing } from "@sd/domain-search";
import { useRouter, useNavigation } from "expo-router";
import { Activity, useState, useEffect, useCallback } from "react";
import { useUnistyles } from "react-native-unistyles";

import { ExploreRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { SearchFilter } from "@/features/search/components/SearchFilter/SearchFilter";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { SearchResultsList } from "@/features/search/components/SearchResultsList/SearchResultsList";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";
import { NativeButton, NativeScreenHost, NativeText } from "@/shared/ui";

export function ErrorBoundary({ error: _error, retry }: ErrorBoundaryProps) {
  return (
    <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
      <NativeText variant="titleLg" colorRole="strong">
        Something went wrong
      </NativeText>
      <NativeButton label="Try again" variant="primary" size="md" onPress={retry} />
    </NativeScreenHost>
  );
}

export default function ExploreIndexRoute() {
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
    <NativeScreenHost testID="explore-index-host">
      <Activity mode={isSearching ? "hidden" : "visible"}>
        <ExploreRecentScreen
          onNavigateToListing={navigateToListing}
          onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
        />
      </Activity>

      <Activity mode={isSearching ? "visible" : "hidden"}>
        <ScrollView showsIndicators={false}>
          <Column style={{ paddingHorizontal: theme.spacing.layout.pageX }}>
            {shouldSearch ? (
              <Column spacing={theme.spacing.scale.sm}>
                <SearchFilter value={filter} onChange={setFilter} topics={topics} />
              </Column>
            ) : null}
            <SearchResultsList
              items={items}
              isFetching={isFetching}
              shouldSearch={shouldSearch}
              errorMessage={errorMessage}
              renderItem={renderSearchResultItem}
            />
          </Column>
        </ScrollView>
      </Activity>
    </NativeScreenHost>
  );
}
