import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";
import { Skeleton } from "@/shared/components/Skeleton/Skeleton";

import { ScholarMedallion, type ScholarMedallionItem } from "./scholar-medallion";

export type ScholarMedallionsRailProps = {
  scholars: ScholarMedallionItem[];
  onSelectScholar?: (slug: string) => void;
  onSeeAllScholars?: () => void;
  isLoading?: boolean;
};

const SKELETON_COUNT = 5;

export function ScholarMedallionsRail({
  scholars,
  onSelectScholar,
  onSeeAllScholars,
  isLoading,
}: ScholarMedallionsRailProps) {
  const { t } = useTranslation();

  if (isLoading && (!scholars || scholars.length === 0)) {
    return (
      <View style={styles.section} testID="scholar-medallions-rail-skeleton">
        <View style={styles.header}>
          <AppText variant="titleMd" color="strong" style={styles.titleText}>
            {t("home.studyWithScholar", "Study with a scholar")}
          </AppText>
          <Pressable hitSlop={8}>
            <AppText variant="caption" color="primary" style={styles.seeAllText}>
              {t("common.seeAll", "See all")}
            </AppText>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.railContent}
          scrollEnabled={false}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <View key={`scholar-skeleton-${i}`} style={styles.skeletonMedallion}>
              <Skeleton width={62} height={62} borderRadius={20} />
              <Skeleton width={56} height={10} style={styles.skeletonName} />
              <Skeleton width={40} height={10} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!scholars || scholars.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} testID="scholar-medallions-rail">
      <View style={styles.header}>
        <AppText variant="titleMd" color="strong" style={styles.titleText}>
          {t("home.studyWithScholar", "Study with a scholar")}
        </AppText>
        <Pressable onPress={onSeeAllScholars} hitSlop={8}>
          <AppText variant="caption" color="primary" style={styles.seeAllText}>
            {t("common.seeAll", "See all")}
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
      >
        {scholars.map((scholar) => (
          <ScholarMedallion
            key={scholar.id ?? scholar.slug}
            scholar={scholar}
            onPress={onSelectScholar}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  railContent: {
    paddingHorizontal: 16,
  },
  skeletonMedallion: {
    alignItems: "center",
    marginRight: 14,
    width: 76,
  },
  skeletonName: {
    marginTop: 8,
  },
});
