import { useCallback } from "react";
import { FlatList } from "react-native";
import type { ListRenderItemInfo } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useFeed } from "@sd/domain-content";
import { useTranslation } from "@/core/i18n/use-translation";
import { FeedContentCard } from "../components/feed-content-card/feed-content-card";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";
import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import { FeedLoadingFooter, FeedStatusView } from "../components/feed-status/feed-status";

export type FeedScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function renderFeedItem(
  item: FeedItemDto,
  onNavigateToLecture?: (slug: string) => void,
  onNavigateToScholar?: (slug: string) => void,
) {
  switch (item.kind) {
    case "scholar_row":
      return <FeedScholarRow scholars={item.scholars} onScholarPress={onNavigateToScholar} />;
    case "topic_row":
      return (
        <FeedTopicRow
          topicName={item.topicName}
          items={item.items}
          onItemPress={onNavigateToLecture}
        />
      );
    default:
      return (
        <FeedContentCard
          item={item as FeedContentItemDto}
          onPress={() => onNavigateToLecture?.((item as FeedContentItemDto).slug)}
        />
      );
  }
}

function getItemKey(item: FeedItemDto, index: number): string {
  if (item.kind === "scholar_row") return `scholar-row-${index}`;
  if (item.kind === "topic_row") return `topic-row-${index}`;
  return item.id;
}

export function FeedScreen({ onNavigateToLecture, onNavigateToScholar }: FeedScreenProps) {
  const { t } = useTranslation();
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } = useFeed();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedItemDto>) =>
      renderFeedItem(item, onNavigateToLecture, onNavigateToScholar),
    [onNavigateToLecture, onNavigateToScholar],
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

const styles = StyleSheet.create(() => ({
  listContent: {
    padding: 8,
    gap: 8,
  },
}));
