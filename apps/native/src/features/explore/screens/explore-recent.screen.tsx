import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useExploreRecentScreen } from "@sd/domain-content";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { ScreenView } from "@/shared/ui";

import { ExplorePodcastRow } from "../components/explore-podcast-row/explore-podcast-row";
import { ExploreScholarRow } from "../components/explore-scholar-row/explore-scholar-row";
import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";
import { ExploreTopicRow } from "../components/explore-topic-row/explore-topic-row";

/** Composes native explore and catalog surfaces for browsing available content. */
/** Describes the inputs, callbacks, and optional state accepted by Explore Recent Screen. */
export type ExploreRecentScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

type GroupedFeedItem =
  | FeedItemDto
  | {
      /** Defines the native kind contract used by this module. */
      kind: "grouped_podcasts";
      id: string;
      items: FeedContentItemDto[];
    };

type StackScreenOptions = React.ComponentProps<typeof Stack.Screen>["options"];

function ExploreRecentStatus({
  headerSearchOptions,
  isError,
  isFetching,
  hasItems,
  t,
  refetch,
}: {
  headerSearchOptions: StackScreenOptions;
  /** Indicates that the associated request or operation failed and should render its error state. */
  isError: boolean;
  isFetching: boolean;
  hasItems: boolean;
  t: ReturnType<typeof useTranslation>["t"];
  refetch: () => void;
}) {
  if (isError && !hasItems) {
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
        <ExploreStatusView message={getEmptyStateText("feed", t)} />
      </ScreenView>
    );
  }
  return null;
}

function filterFeedItems(items: FeedItemDto[], searchQuery: string): FeedItemDto[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => {
    if (item.kind === "scholar_row") {
      return item.scholars.some((scholar) => scholar.name.toLowerCase().includes(query));
    }
    if (item.kind === "topic_row") {
      return (
        item.topicName.toLowerCase().includes(query) ||
        item.items.some((content) => content.title.toLowerCase().includes(query))
      );
    }
    return item.title.toLowerCase().includes(query);
  });
}

function groupFeedItems(items: FeedItemDto[]): GroupedFeedItem[] {
  const grouped: GroupedFeedItem[] = [];
  let currentGroup: FeedContentItemDto[] = [];

  items.forEach((item) => {
    if (item.kind === "scholar_row" || item.kind === "topic_row") {
      if (currentGroup.length > 0) {
        grouped.push({
          kind: "grouped_podcasts",
          id: `group-${grouped.length}`,
          items: currentGroup,
        });
        currentGroup = [];
      }
      grouped.push(item);
    } else {
      currentGroup.push(item);
    }
  });

  if (currentGroup.length > 0) {
    grouped.push({ kind: "grouped_podcasts", id: `group-${grouped.length}`, items: currentGroup });
  }
  return grouped;
}

function renderFeedItem(
  item: GroupedFeedItem,
  onNavigateToListing?: (slug: string) => void,
  onNavigateToScholar?: (slug: string) => void,
) {
  if (item.kind === "scholar_row") {
    return <ExploreScholarRow scholars={item.scholars} onScholarPress={onNavigateToScholar} />;
  }
  if (item.kind === "topic_row") {
    return (
      <ExploreTopicRow
        topicName={item.topicName}
        items={item.items}
        onItemPress={onNavigateToListing}
      />
    );
  }
  if (item.kind === "grouped_podcasts") {
    return (
      <View>
        {item.items.map((subItem) => (
          <ExplorePodcastRow
            key={subItem.id}
            item={subItem}
            onNavigateToListing={onNavigateToListing}
          />
        ))}
      </View>
    );
  }
  return null;
}

function getItemKey(item: GroupedFeedItem, index: number): string {
  if (item.kind === "scholar_row") return `scholar-row-${index}`;
  if (item.kind === "topic_row") return `topic-row-${index}`;
  return item.id;
}

/** Renders the native explore recent screen surface and coordinates its user-facing state. */
export function ExploreRecentScreen({
  onNavigateToListing,
  onNavigateToScholar,
}: ExploreRecentScreenProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useExploreRecentScreen();
  const rawItems = data?.pages.flatMap((p) => p.items) ?? [];
  const items = groupFeedItems(filterFeedItems(rawItems, searchQuery));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<GroupedFeedItem>) =>
      renderFeedItem(item, onNavigateToListing, onNavigateToScholar),
    [onNavigateToListing, onNavigateToScholar],
  );

  const headerSearchOptions = {
    headerSearchBarOptions: {
      placeholder: t("explore.searchRecent", "Search recent audios..."),
      onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text),
      onCancelButtonPress: () => setSearchQuery(""),
      ...getThemedSearchBarOptions(theme),
    },
  };

  if (items.length === 0) {
    return (
      <ExploreRecentStatus
        headerSearchOptions={headerSearchOptions}
        isError={isError}
        isFetching={isFetching}
        hasItems={items.length > 0}
        t={t}
        refetch={refetch}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={headerSearchOptions} />
      <FlatList
        data={items}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={isFetching ? <ExploreLoadingFooter /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  listContent: {
    padding: theme.spacing.scale.md,
    gap: theme.spacing.scale.md,
  },
}));
