import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { Bookmark, Clock, CheckCircle } from "lucide-react-native";
import { AppText } from "@/shared/components/AppText/AppText";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type LibraryItemRowProps = {
  item: LibraryItemDto;
  variant: "progress" | "saved" | "completed";
  onPress?: () => void;
};

type LibraryItemIconProps = {
  variant: "progress" | "saved" | "completed";
};

const iconProps = { size: 20, color: "var(--content-muted)" as unknown as string };

function LibraryItemIcon({ variant }: LibraryItemIconProps) {
  switch (variant) {
    case "saved":
      return <Bookmark {...iconProps} testID="library-item-icon-bookmark" />;
    case "progress":
      return <Clock {...iconProps} testID="library-item-icon-clock" />;
    case "completed":
      return <CheckCircle {...iconProps} testID="library-item-icon-check-circle" />;
  }
}

function ProgressBarFill({ percent }: { percent: number }) {
  return (
    <View style={styles.progressTrack} testID="library-progress-bar">
      <View style={[styles.progressFill, { width: `${Math.min(percent, 100)}%` as unknown as number }]} />
    </View>
  );
}

export function LibraryItemRow({ item, variant, onPress }: LibraryItemRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const lectureTitle = pickContentField(item.lectureTitle, item.originalLectureTitle, showOriginal);
  const progress =
    item.durationSeconds && item.progressSeconds
      ? Math.round((item.progressSeconds / item.durationSeconds) * 100)
      : null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.iconContainer}><LibraryItemIcon variant={variant} /></View>
      <View style={styles.content}>
        <AppText variant="bodyMd" numberOfLines={2}>
          {lectureTitle}
        </AppText>
        <AppText variant="caption" style={styles.subtitle}>
          {item.scholarName}
          {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
        </AppText>
        <AppText variant="xs" style={styles.meta}>
          {item.durationSeconds
            ? t("lecture.minutes", "{{count}} min", { count: Math.round(item.durationSeconds / 60) })
            : ""}
          {variant === "progress" && progress !== null
            ? ` · ${t("library.percentListened", "{{percent}}% listened", { percent: progress })}`
            : ""}
          {variant === "saved" && item.savedAt
            ? ` · ${t("library.savedOn", "Saved {{date}}", {
                date: new Date(item.savedAt).toLocaleDateString(),
              })}`
            : ""}
          {variant === "completed" && item.completedAt
            ? ` · ${t("library.completedOn", "Completed {{date}}", {
                date: new Date(item.completedAt).toLocaleDateString(),
              })}`
            : ""}
        </AppText>
        {variant === "progress" && progress !== null ? (
          <ProgressBarFill percent={progress} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    borderBottomWidth: theme.border.width.default,
    borderBottomColor: theme.colors.border.subtle,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    paddingTop: theme.spacing.scale.xs,
  },
  content: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  subtitle: {
    color: theme.colors.content.muted,
  },
  meta: {
    color: theme.colors.content.muted,
  },
  progressTrack: {
    height: 3,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.scale.full,
    marginTop: theme.spacing.scale.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.full,
  },
}));
