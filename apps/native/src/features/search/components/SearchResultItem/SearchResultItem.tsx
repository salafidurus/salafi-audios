import { Host } from "@expo/ui";
import { useCallback } from "react";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
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
  /** Identifies the listing passed to the stable navigation callback on activation. */
  listingSlug?: string;
  onNavigateToListing?: (slug: string) => void;
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
  listingSlug,
  onNavigateToListing,
}: SearchResultItemProps) {
  const { t } = useTranslation();
  const handlePress = useCallback(() => {
    if (listingSlug && onNavigateToListing) {
      onNavigateToListing(listingSlug);
      return;
    }
    onPress?.();
  }, [listingSlug, onNavigateToListing, onPress]);
  const durationLabel = formatDuration(durationSeconds, t);
  const supportingText = [scholarName, formatLectureCount(lectureCount, t), durationLabel]
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
        onPress={handlePress}
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

function formatLectureCount(count: number, t: ReturnType<typeof useTranslation>["t"]): string {
  return t("search.lectureCount", "{{count}} lectures", { count });
}

function formatDuration(
  durationSeconds: number | undefined,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (!durationSeconds || durationSeconds <= 0) return "";
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  if (hours > 0) {
    return t("search.durationHours", "{{hours}}hr {{minutes}}m", {
      hours,
      minutes: String(minutes).padStart(2, "0"),
    });
  }
  return minutes > 0 ? t("search.durationMinutes", "{{minutes}}m", { minutes }) : "";
}
