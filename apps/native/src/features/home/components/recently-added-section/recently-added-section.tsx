import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";

import { ParchmentLectureCard, type ParchmentLectureCardItem } from "../lecture-card/lecture-card";

export type RecentlyAddedSectionProps = {
  items: ParchmentLectureCardItem[];
  onSelectLecture?: (slug: string) => void;
  onSeeAllRecent?: () => void;
};

export function RecentlyAddedSection({
  items,
  onSelectLecture,
  onSeeAllRecent,
}: RecentlyAddedSectionProps) {
  const { t } = useTranslation();

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
  },
});
