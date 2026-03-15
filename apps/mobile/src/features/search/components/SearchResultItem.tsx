import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Clock } from "lucide-react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { HeadsetIcon } from "@hugeicons/core-free-icons";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { EaseView } from "react-native-ease";
import { useState } from "react";

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
  const resolvedImage = imageUrl ? { uri: imageUrl } : null;

  return (
    <EaseView
      animate={{ scale: isPressed ? 0.97 : 1, opacity: isPressed ? 0.92 : 1 }}
      transition={{ type: "spring", damping: 10, stiffness: 120 }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: pressed ? theme.colors.surface.hover : theme.colors.surface.default },
        ]}
      >
        <View style={styles.media}>
          {resolvedImage ? (
            <Image source={resolvedImage} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={styles.coverFallback} />
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.scholarName} numberOfLines={1}>
            {scholarName}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <HugeiconsIcon
                icon={HeadsetIcon}
                size={16}
                color={theme.colors.content.muted}
                strokeWidth={1.5}
              />
              <Text style={styles.metaText}>{formatLectureCount(lectureCount)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.content.muted} strokeWidth={2} />
              <Text style={styles.metaText}>{formatDuration(durationSeconds)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </EaseView>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    padding: theme.spacing.component.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
  },
  media: {
    width: theme.spacing.scale["4xl"],
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
    ...theme.typography.titleMd,
    color: theme.colors.content.strong,
  },
  scholarName: {
    ...theme.typography.bodySm,
    color: theme.colors.content.muted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.xs,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.content.muted,
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
    return "0m";
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}hr ${String(minutes).padStart(2, "0")}m`;
  }

  return `${minutes}m`;
}
