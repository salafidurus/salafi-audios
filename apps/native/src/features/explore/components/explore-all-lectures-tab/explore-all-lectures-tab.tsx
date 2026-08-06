import type { ListRenderItemInfo } from "react-native";

import {
  buildSearchResultRows,
  type SearchResultRow,
  useSearchCatalog,
  useTopicsList,
} from "@sd/domain-search";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ParchmentLectureCard } from "@/features/home/components/lecture-card/lecture-card";
import { AppText } from "@/shared/components/AppText/AppText";

import { ExploreStatusView } from "../explore-status/explore-status";

export type ExploreAllLecturesTabProps = {
  onNavigateToListing?: (slug: string) => void;
};

/**
 * "All Lectures" sub-tab.
 *
 * Shows topic/category filter chips at the top.
 * Selecting a chip filters the lecture list in-place via the backend search API
 * (GET /search/extended?topicSlug=<slug>).
 * "All" shows unfiltered results.
 */
export function ExploreAllLecturesTab({ onNavigateToListing }: ExploreAllLecturesTabProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);

  // Topics for the category filter chips
  const { data: topics } = useTopicsList();

  const sortedTopics = useMemo(
    () => [...(topics ?? [])].sort((a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99)),
    [topics],
  );

  // Backend search filtered by topic
  const searchParams = useMemo(
    () => ({
      topicSlug: selectedTopicSlug ?? undefined,
      limit: 30,
    }),
    [selectedTopicSlug],
  );

  const { data, isFetching, isError, refetch } = useSearchCatalog(searchParams);

  const rows = useMemo(() => buildSearchResultRows(data, false), [data]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SearchResultRow>) => (
      <ParchmentLectureCard
        item={{
          id: item.id,
          slug: item.slug,
          title: item.title,
          scholarName: item.scholarName,
          lessonsCount: item.lectureCount,
          dateFormatted: `${item.lectureCount} ${item.lectureCount === 1 ? "lecture" : "lectures"}`,
        }}
        onPress={() => onNavigateToListing?.(item.slug)}
      />
    ),
    [onNavigateToListing],
  );

  const handleChipPress = (slug: string | null) => {
    setSelectedTopicSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <View style={styles.container}>
      {/* Category filter chips */}
      {sortedTopics.length > 0 && (
        <View style={styles.chipsWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
            data={[null, ...sortedTopics.map((t) => t.slug)]}
            keyExtractor={(item) => item ?? "all"}
            renderItem={({ item: slug }) => {
              const isAll = slug === null;
              const isActive = isAll ? selectedTopicSlug === null : selectedTopicSlug === slug;
              const label = isAll
                ? t("common.all", "All")
                : (sortedTopics.find((tp) => tp.slug === slug)?.name ?? slug ?? "");
              const displayLabel =
                typeof label === "string"
                  ? label
                  : ((label as any)?.en ?? (label as any)?.ar ?? String(label));

              return (
                <Pressable
                  key={slug ?? "all"}
                  testID={`all-lectures-chip-${slug ?? "all"}`}
                  onPress={() => handleChipPress(slug)}
                  style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <AppText
                    variant="caption"
                    style={[
                      styles.chipText,
                      {
                        color: isActive
                          ? theme.colors.content.onPrimary
                          : theme.colors.content.default,
                      },
                    ]}
                  >
                    {displayLabel}
                  </AppText>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Result count label */}
      {!isFetching && rows.length > 0 && (
        <View style={styles.countRow}>
          <AppText variant="xs" style={{ color: theme.colors.content.muted }}>
            {selectedTopicSlug
              ? t("explore.all.filteredCount", "{{count}} lectures", { count: rows.length })
              : t("explore.all.totalCount", "{{count}} lectures", { count: rows.length })}
          </AppText>
        </View>
      )}

      {/* Loading */}
      {isFetching && (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={theme.colors.content.muted} />
        </View>
      )}

      {/* Error */}
      {isError && !isFetching && (
        <ExploreStatusView
          message={t("explore.all.error", "Couldn't load lectures. Please try again.")}
          onRetry={() => refetch()}
          retryLabel={t("feed.retry", "Try Again")}
        />
      )}

      {/* Empty */}
      {!isFetching && !isError && rows.length === 0 && (
        <ExploreStatusView
          message={
            selectedTopicSlug
              ? t("explore.all.emptyCategory", "Nothing in this category yet.")
              : t("explore.all.empty", "No lectures found.")
          }
          onRetry={selectedTopicSlug ? () => setSelectedTopicSlug(null) : undefined}
          retryLabel={t("explore.all.clearFilter", "Clear filter")}
        />
      )}

      {/* Lecture list */}
      {!isFetching && rows.length > 0 && (
        <View style={styles.listCard}>
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  chipsWrapper: {
    paddingTop: theme.spacing.scale.sm,
    paddingBottom: theme.spacing.scale.xs,
  },
  chipsContent: {
    paddingHorizontal: theme.spacing.layout.pageX,
    gap: theme.spacing.scale.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.component.chip,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primary,
  },
  chipInactive: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border.subtle,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  countRow: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: theme.spacing.scale.sm,
    paddingBottom: 2,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listCard: {
    marginHorizontal: theme.spacing.layout.pageX,
    marginTop: theme.spacing.scale.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.scale["2xl"],
  },
}));
