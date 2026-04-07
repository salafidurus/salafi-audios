import { View, Text, FlatList } from "react-native";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedContentCardNative } from "../components/feed-content-card/feed-content-card.native";
import { FeedScholarRowNative } from "../components/feed-scholar-row/feed-scholar-row.native";
import { useFeed } from "../hooks/use-feed";

export type FeedFollowingMobileNativeScreenProps = {
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
      return <FeedScholarRowNative scholars={item.scholars} onScholarPress={onNavigateToScholar} />;
    case "topic_row":
      return null;
    default:
      return (
        <FeedContentCardNative
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

export function FeedFollowingMobileNativeScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingMobileNativeScreenProps) {
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
