import type { FeedContentItemDto, ScholarListItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useExploreRecentScreen, useInfiniteScholarsList } from "@sd/domain-content";
import { Sparkles } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ParchmentLectureCard } from "@/features/home/components/lecture-card/lecture-card";
import { ScreenHeader } from "@/shared/components";
import { AppText } from "@/shared/components/AppText/AppText";

import { ExploreAllLecturesTab } from "../components/explore-all-lectures-tab/explore-all-lectures-tab";
import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";
import {
  ExploreSubTabPills,
  type ExploreSub,
} from "../components/explore-sub-tab-pills/explore-sub-tab-pills";

export type ExploreScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
  initialSub?: ExploreSub;
  /** Pre-select a topic filter in the All Lectures tab */
  initialTopicSlug?: string;
};

// ─────────────────────────────────────────────
// Recent sub-tab — clean chronological lecture list
// ─────────────────────────────────────────────
function RecentTab({
  searchQuery,
  onNavigateToListing,
}: {
  searchQuery: string;
  onNavigateToListing?: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useExploreRecentScreen();

  const rawItems = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  // Show only content rows (lectures) — drop scholar_row and topic_row
  const contentItems = useMemo(
    () =>
      rawItems.filter(
        (item): item is FeedContentItemDto =>
          item.kind !== "scholar_row" && item.kind !== "topic_row",
      ),
    [rawItems],
  );

  const filteredItems = useMemo(
    () =>
      searchQuery.trim()
        ? contentItems.filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.scholarName.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : contentItems,
    [contentItems, searchQuery],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedContentItemDto>) => (
      <ParchmentLectureCard
        item={{
          id: item.id,
          slug: item.slug,
          title: item.title,
          scholarName: item.scholarName,
          dateFormatted: item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : undefined,
        }}
        onPress={() => onNavigateToListing?.(item.slug)}
      />
    ),
    [onNavigateToListing],
  );

  if (isError && filteredItems.length === 0) {
    return (
      <ExploreStatusView
        message={getErrorStateText("feed", t)}
        onRetry={() => refetch()}
        retryLabel={t("feed.retry", "Try Again")}
      />
    );
  }

  if (isFetching && filteredItems.length === 0) {
    return <ExploreSkeleton />;
  }

  if (filteredItems.length === 0) {
    return (
      <ExploreStatusView
        message={getEmptyStateText("feed", t)}
        title={t("feed.emptyTitle", "Nothing here yet")}
        description={getEmptyStateText("feed", t)}
      />
    );
  }

  return (
    <View style={styles.listCard}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={isFetching ? <ExploreLoadingFooter /> : null}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// Scholars sub-tab
// ─────────────────────────────────────────────
function ScholarsTab({
  searchQuery,
  onNavigateToScholar,
}: {
  searchQuery: string;
  onNavigateToScholar?: (slug: string) => void;
}) {
  const { t } = useTranslation();
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
    ({ item }: ListRenderItemInfo<ScholarListItemDto>) => (
      <ParchmentLectureCard
        item={{
          id: item.id,
          slug: item.slug,
          title: item.name,
          scholarName: `${item.mainLanguage ? `${item.mainLanguage} · ` : ""}${item.lectureCount} lectures`,
        }}
        onPress={() => onNavigateToScholar?.(item.slug)}
      />
    ),
    [onNavigateToScholar],
  );

  if (isError && allScholars.length === 0) {
    return (
      <ExploreStatusView
        message={getErrorStateText("feed", t)}
        onRetry={() => refetch()}
        retryLabel={t("feed.retry", "Try Again")}
      />
    );
  }

  if (isFetching && allScholars.length === 0) {
    return <ExploreSkeleton />;
  }

  if (filteredScholars.length === 0) {
    return (
      <ExploreStatusView
        message={
          searchQuery
            ? t("scholarContent.searchNoMatch", "No scholars match your search.")
            : getEmptyStateText("feed", t)
        }
      />
    );
  }

  return (
    <View style={styles.listCard}>
      <FlatList
        data={filteredScholars}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetching ? <ExploreLoadingFooter /> : null}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// Curation sub-tab — proper empty state matching prototype
// ─────────────────────────────────────────────
function CurationTab({ onBrowseScholars }: { onBrowseScholars: () => void }) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.curationContainer}>
      <View style={styles.curationIconWrapper}>
        <Sparkles size={32} color={theme.colors.action.primary} />
      </View>

      <AppText variant="titleMd" color="strong" style={styles.curationTitle}>
        {t("explore.curation.title", "Curated collections are coming")}
      </AppText>

      <AppText variant="bodyMd" color="muted" style={styles.curationSubtitle}>
        {t(
          "explore.curation.subtitle",
          "We're putting together themed collections — start-here paths, topic deep dives, and scholar spotlights. Browse Scholars or All Lectures in the meantime.",
        )}
      </AppText>

      <Pressable
        onPress={onBrowseScholars}
        style={styles.curationAction}
        accessibilityRole="button"
      >
        <AppText variant="labelMd" style={styles.curationActionText}>
          {t("explore.curation.action", "Browse Scholars")}
        </AppText>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────
// Main unified ExploreScreen
// ─────────────────────────────────────────────
export function ExploreScreen({
  onNavigateToListing,
  onNavigateToScholar,
  initialSub = "all",
  initialTopicSlug,
}: ExploreScreenProps) {
  const { t } = useTranslation();
  const [activeSub, setActiveSub] = useState<ExploreSub>(initialSub);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync when parent navigates us to a different sub (tab is cached, useState seed only fires once)
  useEffect(() => {
    setActiveSub(initialSub);
  }, [initialSub]);

  const handleTabChange = (sub: ExploreSub) => {
    setActiveSub(sub);
    setSearchQuery("");
  };

  return (
    <View style={styles.screen}>
      {/* Big title header with search */}
      <ScreenHeader
        title={t("navigation.tabs.explore", "Explore")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Floating pill sub-tab switcher */}
      <ExploreSubTabPills active={activeSub} onChange={handleTabChange} />

      {/* Sub-tab content */}
      <View style={styles.content}>
        {activeSub === "recent" && (
          <RecentTab searchQuery={searchQuery} onNavigateToListing={onNavigateToListing} />
        )}
        {activeSub === "all" && (
          <ExploreAllLecturesTab
            key={initialTopicSlug ?? "all"}
            onNavigateToListing={onNavigateToListing}
            initialTopicSlug={initialTopicSlug}
          />
        )}
        {activeSub === "scholars" && (
          <ScholarsTab searchQuery={searchQuery} onNavigateToScholar={onNavigateToScholar} />
        )}
        {activeSub === "curation" && (
          <CurationTab onBrowseScholars={() => handleTabChange("scholars")} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  content: {
    flex: 1,
  },
  listCard: {
    marginHorizontal: theme.spacing.layout.pageX,
    marginTop: theme.spacing.scale.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.scale["2xl"],
  },
  // Curation empty state
  curationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.scale["2xl"],
    gap: theme.spacing.scale.md,
  },
  curationIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.scale.xs,
  },
  curationTitle: {
    textAlign: "center",
    fontWeight: "700",
  },
  curationSubtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
  curationAction: {
    marginTop: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.xl,
    paddingVertical: theme.spacing.scale.sm,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
  },
  curationActionText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "700",
  },
}));
