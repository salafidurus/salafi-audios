import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";

import { ScholarMedallion, type ScholarMedallionItem } from "./scholar-medallion";

export type ScholarMedallionsRailProps = {
  scholars: ScholarMedallionItem[];
  onSelectScholar?: (slug: string) => void;
  onSeeAllScholars?: () => void;
};

export function ScholarMedallionsRail({
  scholars,
  onSelectScholar,
  onSeeAllScholars,
}: ScholarMedallionsRailProps) {
  const { t } = useTranslation();

  if (!scholars || scholars.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} testID="scholar-medallions-rail">
      <View style={styles.header}>
        <AppText variant="titleMd" style={styles.titleText}>
          {t("home.studyWithScholar", "Study with a scholar")}
        </AppText>
        <Pressable onPress={onSeeAllScholars} hitSlop={8}>
          <AppText variant="caption" style={styles.seeAllText}>
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

const styles = StyleSheet.create((theme) => ({
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
    color: theme.colors.content.strong,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.action.primary,
  },
  railContent: {
    paddingHorizontal: 16,
  },
}));
