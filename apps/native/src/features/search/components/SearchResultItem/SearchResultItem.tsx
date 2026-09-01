import { Host } from "@expo/ui";
import { StyleSheet } from "react-native-unistyles";

import { List, NativeIcon, NativeImage } from "@/shared/ui";

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

/**
 * Renders one search result through the native list-row contract.
 * Remote artwork remains an explicit RN image bridge because Expo UI has no
 * universal remote-image primitive; result identity and activation remain
 * owned by the caller through the existing title and press props.
 */
export function SearchResultItem({
  title,
  scholarName,
  imageUrl,
  lectureCount,
  durationSeconds,
  onPress,
}: SearchResultItemProps) {
  const durationLabel = formatDuration(durationSeconds);
  const supportingText = [scholarName, formatLectureCount(lectureCount), durationLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <Host matchContents>
      <List.Item
        title={title}
        supportingText={supportingText}
        leading={
          imageUrl ? (
            <NativeImage
              source={{ uri: imageUrl }}
              style={styles.cover}
              bridgeStyle={styles.media}
              contentFit="cover"
            />
          ) : (
            <NativeIcon name="music" colorRole="muted" />
          )
        }
        onPress={onPress}
        testID="native-list-item"
      >
        {null}
      </List.Item>
    </Host>
  );
}

const styles = StyleSheet.create((theme) => ({
  media: {
    width: 48,
    height: 60,
    borderRadius: theme.radius.component.panelSm,
    overflow: "hidden",
    backgroundColor: theme.colors.surface.subtle,
  },
  cover: {
    width: "100%",
    height: "100%",
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
