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

/** Composes native explore and catalog surfaces for browsing available content. */
/** Describes the inputs, callbacks, and optional state accepted by Explore Scholar Screen. */
export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

type StackScreenOptions = React.ComponentProps<typeof Stack.Screen>["options"];

function ExploreScholarStatus({
  headerSearchOptions,
  isError,
  isFetching,
  hasItems,
  emptyMessage,
  t,
  refetch,
}: {
  headerSearchOptions: StackScreenOptions;
  /** Indicates that the associated request or operation failed and should render its error state. */
  isError: boolean;
  isFetching: boolean;
  hasItems: boolean;
  emptyMessage: string;
  t: ReturnType<typeof useTranslation>["t"];
  refetch: () => void;
}) {
  if (isError && !hasItems) {
    return (
      <ScreenView center>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreStatusView
          message={getErrorStateText("feed", t)}
          onRetry={refetch}
          retryLabel={t("feed.retry", "Try Again")}
        />
      </ScreenView>
    );
  }
  if (isFetching && !hasItems) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreSkeleton />
      </View>
    );
  }
  if (!hasItems) {
    return (
      <ScreenView center>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreStatusView message={emptyMessage} />
      </ScreenView>
    );
  }
  return null;
}

function filterScholars(scholars: ScholarListItemDto[], searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return scholars;
  return scholars.filter(
    (scholar) =>
      scholar.name.toLowerCase().includes(query) || scholar.slug.toLowerCase().includes(query),
  );
}

/** Renders the native explore scholar screen surface and coordinates its user-facing state. */
export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteScholarsList();

  const allScholars = data?.pages.flatMap((p) => p.items) ?? [];

  const filteredScholars = filterScholars(allScholars, searchQuery);

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

  const statusView = (
    <ExploreScholarStatus
      headerSearchOptions={headerSearchOptions}
      isError={isError}
      isFetching={isFetching}
      hasItems={filteredScholars.length > 0}
      emptyMessage={
        searchQuery
          ? t("scholarContent.searchNoMatch", "No scholars match your search.")
          : getEmptyStateText("feed", t)
      }
      t={t}
      refetch={refetch}
    />
  );
  if (statusView) return statusView;

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
