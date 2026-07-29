import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useExploreRecentScreen } from "@sd/domain-content";
import { useCallback } from "react";
import { FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { List } from "@/shared/components/List";

import { FeedPodcastRow } from "../components/feed-podcast-row/feed-podcast-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import { FeedLoadingFooter, FeedStatusView } from "../components/feed-status/feed-status";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";

export type FeedRecentScreenProps = {
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
    return <FeedScholarRow scholars={item.scholars} onScholarPress={onNavigateToScholar} />;
  }
  if (item.kind === "topic_row") {
    return (
      <FeedTopicRow
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
          <FeedPodcastRow
            key={subItem.id}
            item={subItem}
            onPress={() => onNavigateToListing?.(subItem.slug)}
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

export function FeedRecentScreen({
  onNavigateToListing,
  onNavigateToScholar,
}: FeedRecentScreenProps) {
  const { t } = useTranslation();
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useExploreRecentScreen();
  const rawItems = data?.pages.flatMap((p) => p.items) ?? [];

  // Group sequential podcast items into a single container
  const items: GroupedFeedItem[] = [];
  let currentGroup: FeedContentItemDto[] = [];

  rawItems.forEach((item) => {
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
      currentGroup.push(item as FeedContentItemDto);
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

  if (isError && items.length === 0) {
    return (
      <FeedStatusView
        message={getErrorStateText("feed", t)}
        onRetry={() => refetch()}
        retryLabel={t("feed.retry", "Try Again")}
      />
    );
  }

  if (isFetching && items.length === 0) {
    return <FeedSkeleton />;
  }

  if (items.length === 0) {
    return <FeedStatusView message={getEmptyStateText("feed", t)} />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={getItemKey}
      renderItem={renderItem}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.listContent}
      ListFooterComponent={isFetching ? <FeedLoadingFooter /> : null}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  listContent: {
    padding: theme.spacing.scale.md,
    gap: theme.spacing.scale.md,
  },
}));
