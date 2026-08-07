import type { ScholarDetailDto } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

export type ScholarHeaderProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
};

export function ScholarHeader({ scholar }: ScholarHeaderProps) {
  const formatScholarName = useFormatScholarName();
  const { theme } = useUnistyles();
  const router = useRouter();
  const totalHours = Math.max(1, Math.round(scholar.totalDurationSeconds / 3600));
  const initials = scholar.name.trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Back button — replaces the native stack header */}
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <ChevronLeft size={24} color={theme.colors.content.strong} />
      </Pressable>

      {/* Square jade cover box — 84px, matching prototype */}
      <View style={styles.coverBox}>
        {scholar.imageUrl ? (
          <Image source={{ uri: scholar.imageUrl }} style={styles.coverImage} contentFit="cover" />
        ) : (
          <AppText variant="displayMd" style={styles.initialText}>
            {initials}
          </AppText>
        )}
      </View>

      <AppText variant="titleLg" style={styles.name}>
        {formatScholarName(scholar)}
      </AppText>

      {scholar.country || scholar.mainLanguage ? (
        <AppText variant="caption" style={styles.meta}>
          {[scholar.mainLanguage?.toUpperCase(), scholar.country].filter(Boolean).join(" · ")}
        </AppText>
      ) : null}

      {scholar.bio ? (
        <AppText variant="bodyMd" style={styles.bio}>
          {scholar.bio}
        </AppText>
      ) : null}

      {/* Stats: Lectures · Series · Total */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <AppText
            variant="titleMd"
            style={[styles.statValue, { color: theme.colors.content.strong }]}
          >
            {scholar.lectureCount}
          </AppText>
          <AppText variant="caption" style={styles.statLabel}>
            Lectures
          </AppText>
        </View>
        <View style={styles.statItem}>
          <AppText
            variant="titleMd"
            style={[styles.statValue, { color: theme.colors.content.strong }]}
          >
            {scholar.seriesCount}
          </AppText>
          <AppText variant="caption" style={styles.statLabel}>
            Series
          </AppText>
        </View>
        <View style={styles.statItem}>
          <AppText
            variant="titleMd"
            style={[styles.statValue, { color: theme.colors.content.strong }]}
          >
            {totalHours}h
          </AppText>
          <AppText variant="caption" style={styles.statLabel}>
            Total
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingBottom: theme.spacing.scale.md,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
    marginTop: theme.spacing.scale.xs,
    marginBottom: 8,
  },
  coverBox: {
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: theme.colors.surface.primarySubtle,
    borderWidth: 1,
    borderColor: `${theme.colors.action.primary}55`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
  },
  coverImage: {
    width: 84,
    height: 84,
  },
  initialText: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.action.primary,
  },
  name: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
  },
  meta: {
    marginTop: 4,
    textAlign: "center",
    color: theme.colors.content.muted,
  },
  bio: {
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
    color: theme.colors.content.subtle,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    marginTop: 2,
    color: theme.colors.content.muted,
    fontSize: 10.5,
  },
}));
