import type {
  ExploreListingsBatchDto,
  ExploreScholarsBatchDto,
  ExploreTopicsBatchDto,
} from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { mergeExplorePages, useExploreRecentScreen } from "@sd/domain-content";
import { useTopicsList } from "@sd/domain-search";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { RootScreenHeader } from "@/features/navigation";
import { SearchFilter } from "@/features/search";
import { AppText, ScreenView } from "@/shared/ui";

import { ExplorePodcastRow } from "../components/explore-podcast-row/explore-podcast-row";
import { ExploreScholarRow } from "../components/explore-scholar-row/explore-scholar-row";
import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";
import { ExploreTopicBatchRow } from "../components/explore-topic-batch-row/explore-topic-batch-row";

/** Composes the mixed native discovery feed without peer subsection navigation. */
/** Describes navigation callbacks accepted by the Explore root screen. */
export type ExploreScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
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

function renderFeedItem(
  item: ExploreListingsBatchDto | ExploreScholarsBatchDto | ExploreTopicsBatchDto,
  onNavigateToListing?: (slug: string) => void,
  onNavigateToScholar?: (slug: string) => void,
  onTopicPress?: (slug: string) => void,
) {
  if (item.kind === "topics") {
    return (
      <ExploreTopicBatchRow
        title={item.title.label}
        topics={item.items}
        onTopicPress={onTopicPress}
      />
    );
  }

  return (
    <View>
      <AppText variant="titleMd">{item.title.label}</AppText>
      {item.kind === "listings" ? (
        item.items.map((subItem) => (
          <ExplorePodcastRow
            key={subItem.id}
            item={subItem}
            onNavigateToListing={onNavigateToListing}
          />
        ))
      ) : (
        <ExploreScholarRow
          scholars={item.items}
          title={item.title.label}
          onScholarPress={onNavigateToScholar}
        />
      )}
    </View>
  );
}

function getItemKey(
  item: ExploreListingsBatchDto | ExploreScholarsBatchDto | ExploreTopicsBatchDto,
): string {
  return item.id;
}

function getExploreLocale(language: string): "ar" | "en" {
  return language === "ar" ? "ar" : "en";
}

/** Renders the mixed Explore feed and coordinates its user-facing state. */
export function ExploreScreen({ onNavigateToListing, onNavigateToScholar }: ExploreScreenProps) {
  const { i18n, t } = useTranslation();
  const [topicSlug, setTopicSlug] = useState<string | undefined>();
  const { data: topics = [] } = useTopicsList();
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } = useExploreRecentScreen(
    { locale: getExploreLocale(i18n.language), topicSlug },
  );
  const items = mergeExplorePages(data?.pages ?? []);

  const renderItem = useCallback(
    ({
      item,
    }: ListRenderItemInfo<
      ExploreListingsBatchDto | ExploreScholarsBatchDto | ExploreTopicsBatchDto
    >) => renderFeedItem(item, onNavigateToListing, onNavigateToScholar, setTopicSlug),
    [onNavigateToListing, onNavigateToScholar],
  );

  return (
    <ScreenView>
      <RootScreenHeader title={t("explore.title", "Explore")} />
      <View style={styles.filterSection}>
        <AppText variant="titleMd">{t("explore.exploreByTopic", "Explore by topic")}</AppText>
        <AppText variant="bodySm" colorRole="muted">
          {t("explore.exploreByTopicDescription", "Choose a topic to shape your study feed.")}
        </AppText>
        <SearchFilter
          value={topicSlug ? [topicSlug] : []}
          onChange={(value) => setTopicSlug(value[0])}
          topics={topics}
        />
      </View>
      <View style={styles.screen}>
        {items.length === 0 ? (
          <ExploreRecentStatus
            isError={isError}
            isFetching={isFetching}
            hasItems={false}
            t={t}
            refetch={refetch}
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={getItemKey}
            renderItem={renderItem}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={isFetching ? <ExploreLoadingFooter /> : null}
          />
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  listContent: {
    paddingVertical: theme.spacing.scale.md,
    gap: theme.spacing.scale.md,
  },
  filterSection: {
    gap: theme.spacing.scale.xs,
    paddingBottom: theme.spacing.scale.sm,
  },
}));
