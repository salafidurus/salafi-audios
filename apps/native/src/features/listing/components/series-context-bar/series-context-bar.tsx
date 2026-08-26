import type { SeriesContextDto } from "@sd/core-contracts";

import { useQueue } from "@sd/domain-audio";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { audioService } from "@/features/audio";
import { AppText } from "@/shared/components/AppText/AppText";

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
  /** The lesson this bar is shown for — Previous/Next only act when it's the one currently playing. */
  listingSlug: string;
};

export function SeriesContextBar({ seriesContext, listingSlug }: SeriesContextBarProps) {
  const { queue, currentIndex, currentTrack, hasNext, hasPrevious } = useQueue();

  // Prev/Next only make sense relative to the queue that's actually playing this lesson —
  // otherwise they'd show sibling info from an unrelated queue.
  const isActiveQueue = currentTrack?.slug === listingSlug;
  const prevTrack = isActiveQueue && hasPrevious ? (queue[currentIndex - 1] ?? null) : null;
  const nextTrack = isActiveQueue && hasNext ? (queue[currentIndex + 1] ?? null) : null;

  return (
    <View style={styles.container}>
      <AppText variant="labelMd">Series</AppText>
      <AppText variant="titleMd">{seriesContext.seriesTitle}</AppText>
      {prevTrack ? (
        <Pressable onPress={() => audioService.skipToPrevious()}>
          <AppText variant="bodySm" style={styles.navText}>
            Previous: {prevTrack.title}
          </AppText>
        </Pressable>
      ) : null}
      {nextTrack ? (
        <Pressable onPress={() => audioService.skipToNext()}>
          <AppText variant="bodySm" style={styles.navText}>
            Next: {nextTrack.title}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.spacing.scale["2xl"],
    padding: theme.spacing.scale.lg,
    borderRadius: 16,
    backgroundColor: theme.colors.surface.subtle,
    gap: theme.spacing.scale.sm,
  },
  navText: {
    opacity: 0.7,
  },
}));
