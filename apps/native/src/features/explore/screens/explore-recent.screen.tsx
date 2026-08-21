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
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

import { ExplorePodcastRow } from "../components/explore-podcast-row/explore-podcast-row";
import { ExploreScholarRow } from "../components/explore-scholar-row/explore-scholar-row";
import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";
import { ExploreTopicRow } from "../components/explore-topic-row/explore-topic-row";

export type ExploreRecentScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

type GroupedFeedItem =
  | FeedItemDto
  | {
      kind: "grouped_podcasts";
      id: string;
      items: FeedContentItemDto[];
    };

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
      <List>
        {item.items.map((subItem, index) => (
          <ExplorePodcastRow
            key={subItem.id}
            item={subItem}
            onNavigateToListing={onNavigateToListing}
            hideBorder={index === item.items.length - 1}
          />
        ))}
      </List>
    );
  }
  return null;
}

function getItemKey(item: GroupedFeedItem, index: number): string {
  if (item.kind === "scholar_row") return `scholar-row-${index}`;
  if (item.kind === "topic_row") return `topic-row-${index}`;
  return item.id;
}

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

  const filteredRawItems = searchQuery.trim()
    ? rawItems.filter((item) => {
        if (item.kind === "scholar_row") {
          return item.scholars.some((s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }
        if (item.kind === "topic_row") {
          return (
            item.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.items.some((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        return item.title.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : rawItems;

  // Group sequential podcast items into a single container
  const items: GroupedFeedItem[] = [];
  let currentGroup: FeedContentItemDto[] = [];

  filteredRawItems.forEach((item) => {
    if (item.kind === "scholar_row" || item.kind === "topic_row") {
      if (currentGroup.length > 0) {
        items.push({
          kind: "grouped_podcasts",
          id: `group-${items.length}`,
          items: currentGroup,
        });
        currentGroup = [];
      }
      items.push(item);
    } else {
      currentGroup.push(item);
    }
  });

  if (currentGroup.length > 0) {
    items.push({
      kind: "grouped_podcasts",
      id: `group-${items.length}`,
      items: currentGroup,
    });
  }

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

  if (isError && items.length === 0) {
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

  if (isFetching && items.length === 0) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreSkeleton />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreStatusView message={getEmptyStateText("feed", t)} />
      </ScreenView>
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
