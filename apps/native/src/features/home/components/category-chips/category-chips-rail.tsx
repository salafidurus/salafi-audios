import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";

export const HOME_CATEGORIES = [
  "all",
  "aqeedah",
  "tafsir",
  "hadith",
  "fiqh",
  "nahw",
  "seerah",
] as const;

export type HomeCategory = (typeof HOME_CATEGORIES)[number];

export type CategoryChipsRailProps = {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
};

export function CategoryChipsRail({
  selectedCategory = "all",
  onSelectCategory,
}: CategoryChipsRailProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID="category-chips-rail">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {HOME_CATEGORIES.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat;
          const label =
            cat === "all"
              ? t("common.all", "All")
              : t(`categories.${cat}`, cat.charAt(0).toUpperCase() + cat.slice(1));

          return (
            <Pressable
              key={cat}
              testID={`category-chip-${cat}`}
              onPress={() => onSelectCategory?.(cat)}
              style={[styles.chip, isActive ? styles.activeChip : styles.inactiveChip]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <AppText
                variant="caption"
                style={[
                  styles.chipText,
                  isActive ? styles.activeChipText : styles.inactiveChipText,
                ]}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: theme.colors.content.primary,
    borderColor: theme.colors.content.primary,
  },
  inactiveChip: {
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  inactiveChipText: {
    color: theme.colors.content.subtle,
  },
}));
