import type { ListingContentItemDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";

import { useAudio, useListingProgress } from "@sd/domain-audio";
import { Play, Pause } from "lucide-react-native";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { audioService } from "@/features/audio";
import { DownloadButton } from "@/features/downloads/components/download-button/download-button";
import { DownloadProgress } from "@/features/downloads/components/download-progress/download-progress";
import { AppText } from "@/shared/ui";

/** Builds native lecture and scholar content surfaces from canonical identities. */
function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

async function playLesson(
  item: ListingContentItemDto,
  queue: Track[],
  isCurrentTrack: boolean,
  isPlaying: boolean,
) {
  if (isCurrentTrack) {
    if (isPlaying) await audioService.pause();
    else await audioService.resume();
    return;
  }

  const track = queue.find((candidate) => candidate.slug === item.slug);
  if (track) await audioService.playListing(track, queue);
}

function renderProgress(progressPercent: number, isCompleted: boolean) {
  if (progressPercent <= 0 || isCompleted) return null;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
    </View>
  );
}

function renderDownload(item: ListingContentItemDto) {
  if (!item.primaryAudioAsset?.url) return null;
  return <DownloadButton listingSlug={item.slug} audioUrl={item.primaryAudioAsset.url} />;
}

function LessonRowContent({
  item,
  duration,
  progressPercent,
  isCompleted,
}: {
  item: ListingContentItemDto;
  /** Stores the media duration used by playback and progress presentation. */
  duration: string;
  progressPercent: number;
  isCompleted: boolean;
}) {
  return (
    <View style={styles.content}>
      <AppText variant="bodyLg" numberOfLines={2}>
        {item.title}
      </AppText>
      {duration ? (
        <AppText variant="bodySm" style={styles.meta}>
          {duration}
        </AppText>
      ) : null}
      {renderProgress(progressPercent, isCompleted)}
      <DownloadProgress listingSlug={item.slug} />
    </View>
  );
}

function LessonRowPlayButton({
  isCurrentlyPlaying,
  theme,
}: {
  isCurrentlyPlaying: boolean;
  theme: ReturnType<typeof useUnistyles>["theme"];
}) {
  return (
    <View style={styles.playButton}>
      {isCurrentlyPlaying ? (
        <Pause size={18} color={theme.colors.content.strong} />
      ) : (
        <Play size={18} color={theme.colors.content.strong} />
      )}
    </View>
  );
}

/** Describes the inputs and callbacks accepted by Lesson Row. */
export type LessonRowProps = {
  item: ListingContentItemDto;
  queue: Track[];
  /** Briefly fades in a highlight background — used when scrolled to via an anchor. */
  highlighted?: boolean;
  /** Reports this row's vertical offset within its scroll container, for anchor scrolling. */
  onLayout?: (id: string, y: number) => void;
};

/**
 * Renders the lesson row through RN because playback gestures, download state,
 * progress animation, and the nested action controls need explicit fallbacks.
 */
export function LessonRow({ item, queue, highlighted = false, onLayout }: LessonRowProps) {
  const { theme } = useUnistyles();
  const { isPlaying, currentTrack } = useAudio();
  const { progressPercent, isCompleted } = useListingProgress(item.slug);

  const isCurrentTrack = currentTrack?.slug === item.slug;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;
  const durationStr = formatDuration(
    item.durationSeconds || item.primaryAudioAsset?.durationSeconds,
  );

  const handlePress = () => playLesson(item, queue, isCurrentTrack, isPlaying);

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => onLayout?.(item.id, e.nativeEvent.layout.y)}
      testID={`lesson-row-${item.id}`}
    >
      <EaseView
        initialAnimate={highlighted ? { backgroundColor: theme.colors.surface.hover } : undefined}
        animate={{ backgroundColor: "transparent" }}
        transition={{ type: "timing", duration: 2000 }}
      >
        <View style={styles.row}>
          <Pressable onPress={handlePress} style={styles.primaryAction}>
            <LessonRowContent
              item={item}
              duration={durationStr}
              progressPercent={progressPercent}
              isCompleted={isCompleted}
            />
            <LessonRowPlayButton isCurrentlyPlaying={isCurrentlyPlaying} theme={theme} />
          </Pressable>
          {renderDownload(item)}
        </View>
      </EaseView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.layout.pageX,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
  },
  content: {
    flex: 1,
    gap: theme.spacing.scale.xs,
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
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface.subtle,
  },
}));
