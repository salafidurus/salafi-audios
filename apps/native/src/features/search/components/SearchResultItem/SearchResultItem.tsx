import { Image } from "expo-image";
import { Clock3, Headphones } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { MarqueeText } from "@/shared/components/MarqueeText";

/** Implements native search input, filtering, results, and empty states. */
/** Describes the inputs, callbacks, and optional state accepted by Search Result Item. */
export type SearchResultItemProps = {
  title: string;
  scholarName: string;
  imageUrl?: string;
  lectureCount: number;
  /** Stores the media duration used by playback and progress presentation. */
  durationSeconds?: number;
  onPress?: () => void;
};

/** Defines the native search result item contract used by this module. */
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

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        <View style={styles.media}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={styles.coverFallback}>
              <Headphones size={20} color={theme.colors.content.subtle} />
            </View>
          )}
        </View>
        <View style={styles.body}>
          <View>
            <MarqueeText text={title} variant="titleMd" style={styles.title} />
            <MarqueeText text={scholarName} variant="bodySm" style={styles.scholarName} />
            <View style={styles.metaRow}>
              <Headphones size={11} color={theme.colors.content.muted} />
              <AppText variant="caption" style={styles.metaText}>
                {formatLectureCount(lectureCount)}
              </AppText>
              {durationLabel ? (
                <>
                  <AppText variant="caption" style={styles.metaText}>
                    {" "}
                    ·{" "}
                  </AppText>
                  <Clock3 size={11} color={theme.colors.content.muted} />
                  <AppText variant="caption" style={styles.metaText}>
                    {durationLabel}
                  </AppText>
                </>
              ) : null}
            </View>
          </View>
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
    padding: theme.spacing.component.cardPadding,
  },
  cardPressed: {
    opacity: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
    width: "100%",
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
