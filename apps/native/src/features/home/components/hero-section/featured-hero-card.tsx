import { Play, Sparkles } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";

export type FeaturedHeroCardItem = {
  id: string;
  slug: string;
  title: string;
  scholarName: string;
  totalLessonsCount?: number;
  badgeText?: string;
};

export type FeaturedHeroCardProps = {
  item: FeaturedHeroCardItem;
  onPress?: (slug: string) => void;
};

export function FeaturedHeroCard({ item, onPress }: FeaturedHeroCardProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  const totalLessons = item.totalLessonsCount ?? 1;

  return (
    <Pressable
      testID={`featured-hero-card-${item.slug}`}
      onPress={() => onPress?.(item.slug)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>
          <Sparkles size={14} color={theme.colors.content.primary} />
        </View>
        <AppText variant="xs" color="primary" style={styles.badgeText}>
          {item.badgeText ?? t("home.recommendedStartingPoint", "RECOMMENDED STARTING POINT")}
        </AppText>
      </View>

      <AppText variant="displayMd" color="strong" style={styles.titleText} numberOfLines={2}>
        {item.title}
      </AppText>

      <AppText variant="caption" color="subtle" style={styles.scholarText} numberOfLines={1}>
        {item.scholarName}
      </AppText>

      <View style={styles.bottomRow}>
        <AppText variant="caption" color="subtle" style={styles.lessonsCountText}>
          {t("home.lessonsInSeries", "{{count}} lessons in series", { count: totalLessons })}
        </AppText>
        <View style={styles.startButton}>
          <View style={styles.iconWrapper}>
            <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <AppText variant="caption" style={styles.startButtonText}>
            {t("home.startListening", "Start Listening")}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1.5,
    borderColor: theme.colors.border.strong,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWrapper: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 4,
  },
  scholarText: {
    fontSize: 13,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonsCountText: {
    color: theme.colors.content.muted,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.content.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
}));
