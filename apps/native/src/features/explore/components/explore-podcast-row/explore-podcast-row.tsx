import type { MenuAction } from "@expo/ui/community/menu";
import type { FeedContentItemDto, ListingContentsDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";

import { httpClient, endpoints } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useAudio, useListingProgress, buildTrackQueue } from "@sd/domain-audio";
import { useFormattedScholarName, useIsSaved, markSaved, markUnsaved } from "@sd/domain-content";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { audioService } from "@/features/audio";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

export type ExplorePodcastRowProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
  onNavigateToListing?: (slug: string) => void;
  hideBorder?: boolean;
};

export function ExplorePodcastRow({
  item,
  onPress,
  onNavigateToListing,
  hideBorder = false,
}: ExplorePodcastRowProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const scholarName = item.scholarName;
  const displayScholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);
  const { progressPercent } = useListingProgress(item.id);

  const { isPlaying, currentTrack } = useAudio();
  const isCurrentTrack =
    currentTrack?.id === item.id ||
    currentTrack?.seriesId === item.id ||
    currentTrack?.collectionId === item.id;

  const isSaved = useIsSaved(item.id);

  const handlePlay = async () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    // A Series/Collection row has no audio asset of its own — fetch its
    // contents on tap and play the full ordered queue starting at the first
    // lesson, instead of mis-tracking progress against the row's own id.
    if (item.kind !== "single") {
      try {
        const contents = await httpClient<ListingContentsDto>({
          url: endpoints.listings.contents(item.slug),
          method: "GET",
        });
        const queue = buildTrackQueue(
          {
            id: item.id,
            title,
            format: item.kind,
            scholarName,
            scholarSlug: item.scholarSlug,
            artworkUrl: item.thumbnailUrl ?? undefined,
          },
          contents,
        );
        const firstTrack = queue[0];
        if (firstTrack) {
          await audioService.playListing(firstTrack, queue);
          return;
        }
      } catch {
        // Fall through to the single-track fallback below.
      }
    }

    const track: Track = {
      id: item.id,
      slug: item.slug,
      title,
      artist: scholarName,
      scholarSlug: item.scholarSlug,
      url: "",
      durationSeconds: item.durationSeconds ?? 0,
      artworkUrl: item.thumbnailUrl ?? undefined,
      seriesId: null,
      seriesTitle: null,
    };

    await audioService.playListing(track, [track]);
  };

  const handleDetails = () => {
    if (onPress) {
      onPress();
    } else if (onNavigateToListing) {
      onNavigateToListing(item.slug);
    }
  };

  const handleSave = () => {
    if (isSaved) {
      markUnsaved(item.id, item.slug);
    } else {
      markSaved(item.id, item.slug);
    }
  };

  const durationText = item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : "";
  const publishedDateText = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "";

  const actions: MenuAction[] = [
    { id: "details", title: "Details" },
    { id: "save", title: "Save", state: isSaved ? "on" : "off" },
  ];

  const handleAction = (id: string) => {
    if (id === "details") handleDetails();
    if (id === "save") handleSave();
  };

  return (
    <List.Item onPress={handlePlay} hideBorder={hideBorder} testID="podcast-row-item">
      <View style={styles.rowContent} testID="podcast-row">
        <UserAvatar image={item.thumbnailUrl} name={scholarName} size={64} />
        <View style={styles.content}>
          <MarqueeText text={title} variant="titleMd" />
          <MarqueeText text={displayScholarName} variant="bodySm" />
          <View style={styles.details}>
            <AppText variant="xs" style={styles.metaText}>
              {durationText}
              {durationText && publishedDateText && " · "}
              {publishedDateText}
            </AppText>
          </View>
          {progressPercent > 0 && progressPercent < 100 ? (
            <View style={styles.progressTrack} testID="progress-bar-track">
              <View style={[styles.progressBar, { width: `${Math.round(progressPercent)}%` }]} />
            </View>
          ) : null}
        </View>
      </View>

      <List.Item.Actions actions={actions} onAction={handleAction} />
    </List.Item>
  );
}

const styles = StyleSheet.create((theme) => ({
  rowContent: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
    flex: 1,
  },
  content: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  details: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
  },
  metaText: {
    color: theme.colors.content.subtle,
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
    backgroundColor: theme.colors.content.strong,
  },
}));
