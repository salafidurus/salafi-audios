import { Pressable, View, Image } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useLectureProgress } from "@sd/domain-audio";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";

export type FeedPodcastRowProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedPodcastRow({ item, onPress }: FeedPodcastRowProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const { progressPercent } = useLectureProgress(item.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      testID="podcast-row"
    >
      <View style={styles.thumbnailContainer}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
            testID="podcast-thumbnail"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder} testID="podcast-thumbnail-placeholder" />
        )}
      </View>
      <View style={styles.content}>
        <AppText variant="bodyMd" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="caption">
          {item.scholarName}
          {item.kind !== "single" ? ` · ${item.kind}` : ""}
        </AppText>
        <View style={styles.details}>
          {item.durationSeconds ? (
            <AppText variant="xs">{Math.round(item.durationSeconds / 60)} min</AppText>
          ) : null}
          <AppText variant="xs">{new Date(item.publishedAt).toLocaleDateString()}</AppText>
        </View>
        {progressPercent > 0 && progressPercent < 100 ? (
          <View style={styles.progressTrack} testID="progress-bar-track">
            <View style={[styles.progressBar, { width: `${Math.round(progressPercent)}%` }]} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnailContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.scale.sm,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.scale.sm,
  },
  content: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  details: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
  },
  progressTrack: {
    height: 3,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.subtle,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
  },
}));
