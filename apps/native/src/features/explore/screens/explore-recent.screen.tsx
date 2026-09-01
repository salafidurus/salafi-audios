import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useExploreRecentScreen } from "@sd/domain-content";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/ui";

import { ExplorePodcastRow } from "../components/explore-podcast-row/explore-podcast-row";
import { ExploreScholarRow } from "../components/explore-scholar-row/explore-scholar-row";
import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";
import { ExploreTopicRow } from "../components/explore-topic-row/explore-topic-row";

/** Composes the mixed native discovery feed without peer subsection navigation. */
/** Describes navigation callbacks accepted by the Explore root screen. */
export type ExploreScreenProps = {
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

function ExploreRecentStatus({
  isError,
  isFetching,
  hasItems,
  t,
  refetch,
}: {
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
        <ExploreSkeleton />
      </View>
    );
  }
  if (!hasItems) {
    return (
      <ScreenView center>
        <ExploreStatusView message={getEmptyStateText("feed", t)} />
      </ScreenView>
    );
  }
  return null;
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

/** Renders the mixed Explore feed and coordinates its user-facing state. */
export function ExploreScreen({ onNavigateToListing, onNavigateToScholar }: ExploreScreenProps) {
  const { t } = useTranslation();
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useExploreRecentScreen();
  const rawItems = data?.pages.flatMap((p) => p.items) ?? [];
  const items = groupFeedItems(rawItems);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<GroupedFeedItem>) =>
      renderFeedItem(item, onNavigateToListing, onNavigateToScholar),
    [onNavigateToListing, onNavigateToScholar],
  );

  if (items.length === 0) {
    return (
      <ExploreRecentStatus
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
