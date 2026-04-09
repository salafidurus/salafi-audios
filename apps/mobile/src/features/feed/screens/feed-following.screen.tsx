import { View, Text, FlatList } from "react-native";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedContentCard } from "../components/feed-content-card/feed-content-card";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { useFeed } from "@sd/domain-content";

export type FeedFollowingScreenProps = {
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
      return null;
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

export function FeedFollowingScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useFeed();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading followed scholars...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "#666", textAlign: "center" }}>
          Follow scholars to see their latest lectures here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={getItemKey}
      renderItem={({ item }) => renderFeedItem(item, onNavigateToLecture, onNavigateToScholar)}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ padding: 8 }}
      ListFooterComponent={
        isFetching ? (
          <View style={{ padding: 16, alignItems: "center" }}>
            <Text style={{ color: "#999" }}>Loading more...</Text>
          </View>
        ) : null
      }
    />
  );
}
