import { useState } from "react";
import { View } from "react-native-unistyles/components/native/View";
import { Text } from "react-native-unistyles/components/native/Text";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { Image } from "react-native-unistyles/components/native/Image";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { MarqueeText } from "../MarqueeText";

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
  const [isPressed, setIsPressed] = useState(false);
  const durationLabel = formatDuration(durationSeconds);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={({ pressed }: { pressed: boolean }) => [
        styles.card,
        { backgroundColor: pressed ? theme.colors.surface.hover : theme.colors.surface.default },
      ]}
    >
      <View style={styles.media}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverFallback} />
        )}
      </View>
      <View style={styles.body}>
        <MarqueeText text={title} textStyle={styles.title} />
        <MarqueeText text={scholarName} textStyle={styles.scholarName} />
        <Text style={styles.metaText}>
          {formatLectureCount(lectureCount)}
          {durationLabel ? ` • ${durationLabel}` : ""}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
    _web: {
      padding: theme.spacing.component.cardPadding,
    },
  },
  media: {
    width: "20%",
    aspectRatio: 4 / 5,
    borderRadius: theme.radius.component.panelSm,
    overflow: "hidden",
    backgroundColor: theme.colors.surface.subtle,
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  coverFallback: {
    flex: 1,
    backgroundColor: theme.colors.surface.subtle,
  },
  body: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  title: {
    color: theme.colors.content.strong,
    _web: {
      ...theme.typography.titleMd,
      lineHeight: String(theme.typography.titleMd.lineHeight),
    },
  },
  scholarName: {
    color: theme.colors.content.muted,
    _web: {
      ...theme.typography.bodySm,
      lineHeight: String(theme.typography.bodySm.lineHeight),
    },
  },
  metaText: {
    color: theme.colors.content.muted,
    _web: {
      ...theme.typography.caption,
      lineHeight: String(theme.typography.caption.lineHeight),
    },
  },
}));

function formatLectureCount(count: number): string {
  if (count === 1) {
    return "1 lecture";
  }
  return `${count} lectures`;
}

function formatDuration(durationSeconds?: number): string {
  if (!durationSeconds || durationSeconds <= 0) {
    return "";
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}hr ${String(minutes).padStart(2, "0")}m`;
  }
  if (minutes <= 0) {
    return "";
  }

  return `${minutes}m`;
}
