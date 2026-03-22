"use client";

import { useState } from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Image } from "react-native-unistyles/components/native/Image";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { Text } from "react-native-unistyles/components/native/Text";
import { View } from "react-native-unistyles/components/native/View";
import { Headphones, Clock } from "lucide-react";
import { MarqueeTextMobileWeb } from "../MarqueeText/MarqueeText.mobile.web";

export type SearchResultItemProps = {
  title: string;
  scholarName: string;
  imageUrl?: string;
  lectureCount: number;
  durationSeconds?: number;
  onPress?: () => void;
};

export type SearchResultItemMobileWebProps = SearchResultItemProps;

export function SearchResultItemMobileWeb({
  title,
  scholarName,
  imageUrl,
  lectureCount,
  durationSeconds,
  onPress,
}: SearchResultItemMobileWebProps) {
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
        pressed
          ? {
              backgroundColor: theme.recipes.primarySubtleSurface.backgroundColor,
              borderColor: theme.recipes.primarySubtleSurface.borderColor,
            }
          : {
              backgroundColor: theme.colors.surface.default,
              borderColor: theme.colors.border.subtle,
            },
      ]}
    >
      <View style={styles.media}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverFallback}>
            <Headphones size={20} color={theme.colors.content.subtle} />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <MarqueeTextMobileWeb text={title} textStyle={styles.title} />
        <MarqueeTextMobileWeb text={scholarName} textStyle={styles.scholarName} />
        <View style={styles.metaRow}>
          <Headphones size={11} color={theme.colors.content.muted} />
          <Text style={styles.metaText}>{formatLectureCount(lectureCount)}</Text>
          {durationLabel ? (
            <>
              <Text style={styles.metaText}> · </Text>
              <Clock size={11} color={theme.colors.content.muted} />
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.xs,
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
