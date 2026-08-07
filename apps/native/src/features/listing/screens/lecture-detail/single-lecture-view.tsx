import type { ListingContentsDto, ListingDetailDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";

import { buildTrackQueue } from "@sd/domain-audio";
import { markSaved, markUnsaved, useIsSaved } from "@sd/domain-content";
import { Bookmark, Pause, Play } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { audioService } from "@/features/audio";
import { DownloadButton } from "@/features/downloads/components/download-button/download-button";
import { DownloadProgress } from "@/features/downloads/components/download-progress/download-progress";
import { SeriesContextBar } from "@/features/listing/components/series-context-bar/series-context-bar";
import { TopicChips } from "@/features/listing/components/topic-chips/topic-chips";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

type SingleLectureViewProps = {
  lecture: ListingDetailDto;
  title: string;
  description: string | undefined;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  seriesContents: ListingContentsDto | undefined;
};

export function SingleLectureView({
  lecture,
  title,
  description,
  isPlaying,
  isCurrentTrack,
  seriesContents,
}: SingleLectureViewProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const isSaved = useIsSaved(lecture.id);

  const initial = title.trim().charAt(0).toUpperCase();
  const primaryTopic = lecture.topics?.[0];

  const handlePlay = async () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    // When the immediate parent's contents have loaded, play the full
    // ordered queue for that Series/Module so Next/auto-advance continue
    // through it — not just this one lesson.
    if (lecture.seriesContext && seriesContents) {
      const queue = buildTrackQueue(
        {
          id: lecture.seriesContext.seriesId,
          title: lecture.seriesContext.seriesTitle,
          format: seriesContents.format,
          scholarName: lecture.scholar.name,
          scholarSlug: lecture.scholar.slug,
          artworkUrl: lecture.scholar.imageUrl ?? undefined,
        },
        seriesContents,
        { startAtId: lecture.id },
      );
      const track = queue.find((t) => t.id === lecture.id);
      if (track) {
        await audioService.playListing(track, queue);
        return;
      }
    }

    const track: Track = {
      id: lecture.id,
      slug: lecture.slug,
      title,
      artist: lecture.scholar.name,
      scholarSlug: lecture.scholar.slug,
      url: "",
      durationSeconds: lecture.durationSeconds ?? 0,
      artworkUrl: lecture.scholar.imageUrl ?? undefined,
      seriesId: null,
      seriesTitle: null,
    };

    await audioService.playListing(track, [track]);
  };

  const handleToggleSave = () => {
    if (isSaved) {
      markUnsaved(lecture.id, lecture.slug);
    } else {
      markSaved(lecture.id, lecture.slug);
    }
  };

  return (
    <ScreenView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header: Cover left + badge/title/scholar right */}
        <View style={styles.header}>
          <View style={styles.coverBox}>
            <AppText variant="displayMd" style={styles.initial}>
              {initial}
            </AppText>
          </View>

          <View style={styles.meta}>
            {primaryTopic ? (
              <View style={styles.categoryBadge}>
                <AppText variant="xs" style={styles.categoryBadgeText}>
                  {primaryTopic.name.toUpperCase()}
                </AppText>
              </View>
            ) : null}
            <AppText variant="titleMd" style={styles.title} numberOfLines={3}>
              {title}
            </AppText>
            <AppText variant="caption" color="subtle" style={styles.scholar} numberOfLines={1}>
              {lecture.scholar.name}
            </AppText>
          </View>
        </View>

        {/* Play + Bookmark */}
        <View style={styles.actions}>
          <Pressable
            onPress={handlePlay}
            style={styles.playBtn}
            accessibilityRole="button"
            accessibilityLabel={isCurrentTrack && isPlaying ? "Pause" : "Play"}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause
                size={14}
                color={theme.colors.content.onPrimary}
                fill={theme.colors.content.onPrimary}
              />
            ) : (
              <Play
                size={14}
                color={theme.colors.content.onPrimary}
                fill={theme.colors.content.onPrimary}
              />
            )}
            <AppText variant="labelMd" style={styles.playText}>
              {isCurrentTrack && isPlaying
                ? t("lecture.pause", "Pause")
                : t("lecture.play", "Play")}
            </AppText>
          </Pressable>
          <Pressable
            onPress={handleToggleSave}
            style={styles.bookmarkBtn}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? t("lecture.unsave", "Unsave") : t("lecture.save", "Save")}
          >
            <Bookmark
              size={16}
              color={isSaved ? theme.colors.action.primary : theme.colors.content.subtle}
              fill={isSaved ? theme.colors.action.primary : "none"}
            />
          </Pressable>
        </View>

        <DownloadProgress lectureId={lecture.id} />

        {lecture.primaryAudioAsset?.url ? (
          <DownloadButton lectureId={lecture.id} audioUrl={lecture.primaryAudioAsset.url} />
        ) : null}

        <TopicChips topics={lecture.topics} />

        {description ? (
          <View style={styles.descriptionSection}>
            <AppText variant="bodyMd">{description}</AppText>
          </View>
        ) : null}

        {lecture.seriesContext ? (
          <SeriesContextBar seriesContext={lecture.seriesContext} lectureId={lecture.id} />
        ) : null}
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    paddingBottom: theme.spacing.layout.sectionY,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: theme.spacing.layout.pageY,
    paddingBottom: 4,
  },
  coverBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: theme.colors.surface.primarySubtle,
    borderWidth: 1,
    borderColor: `${theme.colors.action.primary}55`,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initial: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.action.primary,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: `${theme.colors.action.primary}22`,
    borderWidth: 1,
    borderColor: `${theme.colors.action.primary}44`,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.colors.action.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    color: theme.colors.content.strong,
  },
  scholar: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: 16,
    paddingBottom: 4,
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.colors.action.primary,
  },
  playText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: theme.colors.content.onPrimary,
  },
  bookmarkBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  descriptionSection: {
    marginTop: theme.spacing.component.gapLg,
  },
}));
