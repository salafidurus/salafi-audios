import type { ScholarListItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarRow } from "@/features/listing/components/scholar-row/scholar-row";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";

export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteScholarsList();

  const allScholars = data?.pages.flatMap((p) => p.items) ?? [];

  const filteredScholars = searchQuery.trim()
    ? allScholars.filter(
        (scholar) =>
          scholar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scholar.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allScholars;

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ScholarListItemDto>) => (
      <ScholarRow
        scholar={item}
        onPress={onNavigateToScholar}
        hideBorder={index === filteredScholars.length - 1}
      />
    ),
    [onNavigateToScholar, filteredScholars.length],
  );

  const headerSearchOptions = {
    headerSearchBarOptions: {
      placeholder: t("scholarContent.searchScholars", "Search scholars..."),
      onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text),
      onCancelButtonPress: () => setSearchQuery(""),
      ...getThemedSearchBarOptions(theme),
    },
  };

  if (isError && allScholars.length === 0) {
    return (
      <ScreenView center>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreStatusView
          message={getErrorStateText("feed", t)}
          onRetry={() => refetch()}
          retryLabel={t("feed.retry", "Try Again")}
        />
      </ScreenView>
    );
  }

  if (isFetching && allScholars.length === 0) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreSkeleton />
      </View>
    );
  }

  if (filteredScholars.length === 0) {
    return (
      <ScreenView center>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreStatusView
          message={
            searchQuery
              ? t("scholarContent.searchNoMatch", "No scholars match your search.")
              : getEmptyStateText("feed", t)
          }
        />
      </ScreenView>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={headerSearchOptions} />
      <List style={styles.listCard}>
        <FlatList
          data={filteredScholars}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetching ? <ExploreLoadingFooter /> : null}
        />
      </List>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  listCard: {
    margin: theme.spacing.scale.md,
  },
}));
