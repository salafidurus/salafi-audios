import { Image, Pressable, Text, View } from "react-native";
import { Clock3, Headphones } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { MarqueeText } from "../MarqueeText/MarqueeText.native";
import type { ComponentType } from "react";

export type SearchResultItemProps = {
  title: string;
  scholarName: string;
  imageUrl?: string;
  lectureCount: number;
  durationSeconds?: number;
  onPress?: () => void;
};

export function SearchResultItem({
  title,
  scholarName,
  imageUrl,
  lectureCount,
  durationSeconds,
  onPress,
}: SearchResultItemProps) {
  const { theme } = useUnistyles();
  const durationLabel = formatDuration(durationSeconds);
  const HeadphonesIcon = Headphones as ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  const ClockIcon = Clock3 as ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.media}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverFallback}>
            <HeadphonesIcon size={20} color={theme.colors.content.subtle} />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <MarqueeText text={title} textStyle={styles.title} />
        <MarqueeText text={scholarName} textStyle={styles.scholarName} />
        <View style={styles.metaRow}>
          <HeadphonesIcon size={11} color={theme.colors.content.muted} />
          <Text style={styles.metaText}>{formatLectureCount(lectureCount)}</Text>
          {durationLabel ? (
            <>
              <Text style={styles.metaText}> · </Text>
              <ClockIcon size={11} color={theme.colors.content.muted} />
              <Text style={styles.metaText}>{durationLabel}</Text>
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
    padding: theme.spacing.component.cardPadding,
  },
  pressed: {
    backgroundColor: theme.colors.surface.hover,
  },
  media: {
    width: "20%",
    aspectRatio: 4 / 5,
    borderRadius: theme.radius.component.panelSm,
    overflow: "hidden",
    backgroundColor: theme.colors.surface.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  coverFallback: {
    flex: 1,
    width: "100%",
    backgroundColor: theme.colors.surface.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: theme.spacing.scale.xs,
    overflow: "hidden",
  },
  title: {
    color: theme.colors.content.strong,
    ...theme.typography.titleMd,
  },
  scholarName: {
    color: theme.colors.content.muted,
    ...theme.typography.bodySm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.xs,
  },
  metaText: {
    color: theme.colors.content.muted,
    ...theme.typography.caption,
  },
}));

function formatLectureCount(count: number): string {
  if (count === 1) return "1 lecture";
  return `${count} lectures`;
}

function formatDuration(durationSeconds?: number): string {
  if (!durationSeconds || durationSeconds <= 0) return "";
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  if (hours > 0) return `${hours}hr ${String(minutes).padStart(2, "0")}m`;
  if (minutes <= 0) return "";
  return `${minutes}m`;
}
