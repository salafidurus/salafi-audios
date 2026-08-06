import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";
import { Skeleton } from "@/shared/components/Skeleton/Skeleton";

import { ParchmentLectureCard, type ParchmentLectureCardItem } from "../lecture-card/lecture-card";

export type RecentlyAddedSectionProps = {
  items: ParchmentLectureCardItem[];
  onSelectLecture?: (slug: string) => void;
  onSeeAllRecent?: () => void;
  isLoading?: boolean;
};

const SKELETON_COUNT = 4;

export function RecentlyAddedSection({
  items,
  onSelectLecture,
  onSeeAllRecent,
  isLoading,
}: RecentlyAddedSectionProps) {
  const { t } = useTranslation();

  if (isLoading && (!items || items.length === 0)) {
    return (
      <View style={styles.section} testID="recently-added-skeleton">
        <View style={styles.header}>
          <AppText variant="titleMd" color="strong" style={styles.titleText}>
            {t("home.recentlyAdded", "Recently added")}
          </AppText>
          <Pressable hitSlop={8}>
            <AppText variant="caption" color="primary" style={styles.seeAllText}>
              {t("common.seeAll", "See all")}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.list}>
          <Skeleton
            width="100%"
            height={100}
            borderRadius={16}
            style={styles.skeletonFeaturedCard}
          />
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <View key={`recent-skeleton-${i}`} style={styles.skeletonRow}>
              <Skeleton width={40} height={40} borderRadius={10} style={styles.skeletonRowIcon} />
              <View style={styles.skeletonRowText}>
                <Skeleton width="70%" height={14} style={styles.skeletonLine} />
                <Skeleton
                  width="50%"
                  height={12}
                  style={[styles.skeletonLine, styles.skeletonLine2]}
                />
                <Skeleton
                  width="30%"
                  height={12}
                  style={[styles.skeletonLine, styles.skeletonLine3]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section} testID="recently-added-section">
      <View style={styles.header}>
        <AppText variant="titleMd" color="strong" style={styles.titleText}>
          {t("home.recentlyAdded", "Recently added")}
        </AppText>
        {items && items.length > 0 ? (
          <Pressable onPress={onSeeAllRecent} hitSlop={8}>
            <AppText variant="caption" color="primary" style={styles.seeAllText}>
              {t("common.seeAll", "See all")}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {!items || items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText variant="caption" color="subtle" style={styles.emptyText}>
            {t("home.noLecturesForCategory", "No lectures found for this category.")}
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <ParchmentLectureCard
              key={item.id ?? item.slug}
              item={item}
              onPress={onSelectLecture}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 14,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
  },
  list: {
    marginTop: 4,
    gap: 8,
  },
  skeletonFeaturedCard: {
    opacity: 0.5,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skeletonRowIcon: {
    opacity: 0.5,
  },
  skeletonRowText: {
    flex: 1,
    gap: 4,
  },
  skeletonLine: {
    opacity: 0.5,
  },
  skeletonLine2: {
    marginTop: 2,
  },
  skeletonLine3: {
    marginTop: 2,
  },
});
