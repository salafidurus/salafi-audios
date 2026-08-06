import { BookOpen, Play } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";

export type ContinueListeningCardItem = {
  id: string;
  slug: string;
  title: string;
  scholarName: string;
  progressPercent: number; // 0 to 1
  currentLessonNumber?: number;
  totalLessonsCount?: number;
};

export type ContinueListeningCardProps = {
  item: ContinueListeningCardItem;
  onPress?: (slug: string) => void;
};

export function ContinueListeningCard({ item, onPress }: ContinueListeningCardProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  const progressPercentClamped = Math.min(Math.max(item.progressPercent * 100, 0), 100);

  return (
    <Pressable
      testID={`continue-listening-card-${item.slug}`}
      onPress={() => onPress?.(item.slug)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.topRow}>
        <AppText variant="xs" style={styles.badgeText}>
          {t("home.continueListening", "CONTINUE LISTENING")}
        </AppText>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.iconBox}>
          <BookOpen size={24} color={theme.colors.action.primary} />
        </View>

        <View style={styles.textContainer}>
          <AppText variant="titleMd" style={styles.titleText} numberOfLines={2}>
            {item.title}
          </AppText>
          <AppText variant="caption" style={styles.scholarText} numberOfLines={1}>
            {item.scholarName}
          </AppText>
        </View>

        <View style={styles.playCircle}>
          <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercentClamped}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  topRow: {
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: theme.colors.content.primary,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.content.strong,
    lineHeight: 22,
    marginBottom: 4,
  },
  scholarText: {
    fontSize: 13,
    color: theme.colors.content.subtle,
  },
  playCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.action.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.action.primary,
  },
}));
