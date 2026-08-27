import type { MenuAction } from "@expo/ui/community/menu";
import type { FeedContentItemDto, ListingContentsDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";

import { httpClient, endpoints } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import {
  isTrackActiveForListing,
  isListingFormat,
  useAudio,
  useListingProgress,
  buildTrackQueue,
} from "@sd/domain-audio";
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

async function playExploreItem(
  item: FeedContentItemDto,
  title: string,
  scholarName: string,
  isCurrentTrack: boolean,
  isPlaying: boolean,
) {
  if (isCurrentTrack) {
    if (isPlaying) await audioService.pause();
    else await audioService.resume();
    return;
  }

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
}

function showExploreDetails(
  slug: string,
  onPress?: () => void,
  onNavigateToListing?: (slug: string) => void,
) {
  if (onPress) onPress();
  else if (onNavigateToListing) onNavigateToListing(slug);
}

function toggleExploreSave(item: FeedContentItemDto, isSaved: boolean) {
  if (isSaved) markUnsaved(item.id, item.slug);
  else markSaved(item.id, item.slug);
}

function handleExploreAction(
  id: string,
  item: FeedContentItemDto,
  isSaved: boolean,
  onPress?: () => void,
  onNavigateToListing?: (slug: string) => void,
) {
  if (id === "details") showExploreDetails(item.slug, onPress, onNavigateToListing);
  if (id === "save") toggleExploreSave(item, isSaved);
}

function renderProgressBar(progressPercent: number) {
  if (progressPercent <= 0 || progressPercent >= 100) return null;

  return (
    <View style={styles.progressTrack} testID="progress-bar-track">
      <View style={[styles.progressBar, { width: `${Math.round(progressPercent)}%` }]} />
    </View>
  );
}

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
  const { progressPercent } = useListingProgress(item.slug);

  const { isPlaying, currentTrack } = useAudio();
  const isCurrentTrack =
    isListingFormat(item.kind) &&
    isTrackActiveForListing({ id: item.id, slug: item.slug, format: item.kind }, currentTrack);

  const isSaved = useIsSaved(item.id);

  const handlePlay = () => playExploreItem(item, title, scholarName, isCurrentTrack, isPlaying);

  const durationText = item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : "";
  const publishedDateText = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "";

  const actions: MenuAction[] = [
    { id: "details", title: "Details" },
    { id: "save", title: "Save", state: isSaved ? "on" : "off" },
  ];

  const handleAction = (id: string) =>
    handleExploreAction(id, item, isSaved, onPress, onNavigateToListing);

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
          {renderProgressBar(progressPercent)}
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
