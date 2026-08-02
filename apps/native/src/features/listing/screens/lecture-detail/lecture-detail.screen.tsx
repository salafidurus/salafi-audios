import type { Track } from "@sd/domain-audio";

import { pickContentField } from "@sd/core-i18n";
import { useAudio, buildTrackQueue } from "@sd/domain-audio";
import {
  useListingDetail,
  useListingContents,
  useIsSaved,
  markSaved,
  markUnsaved,
} from "@sd/domain-content";
import { router, useLocalSearchParams } from "expo-router";
import { Play, Pause, Bookmark } from "lucide-react-native";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { audioService } from "@/features/audio";
import { LectureMeta } from "@/features/listing/components/lecture-meta/lecture-meta";
import { ListingContentView } from "@/features/listing/components/listing-content-view/listing-content-view";
import { SeriesContextBar } from "@/features/listing/components/series-context-bar/series-context-bar";
import { TopicChips } from "@/features/listing/components/topic-chips/topic-chips";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/Button/Button";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type LectureDetailScreenProps = {
  slug: string;
};

export function LectureDetailScreen({ slug }: LectureDetailScreenProps) {
  const { theme } = useUnistyles();
  const { anchor } = useLocalSearchParams<{ slug: string; anchor?: string }>();
  const { data: lecture, isFetching } = useListingDetail(slug);
  const { data: seriesContents } = useListingContents(lecture?.seriesContext?.seriesSlug ?? "");
  const isContainer = lecture?.format === "series" || lecture?.format === "collection";
  const { data: ownContents } = useListingContents(isContainer ? lecture!.slug : "");
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  const { isPlaying, currentTrack } = useAudio();
  const isCurrentTrack = lecture ? currentTrack?.id === lecture.id : false;

  const isSaved = useIsSaved(lecture?.id ?? "");

  // Slugs are flat and don't encode nesting, so a Lesson/Module's own slug
  // resolves to itself — redirect to the top-level page it belongs under,
  // anchored to this item so the parent page can scroll to and highlight it.
  useEffect(() => {
    if (lecture?.rootListing) {
      router.replace(`/listings/${lecture.rootListing.slug}?anchor=${lecture.id}`);
    }
  }, [lecture]);

  if (isFetching) {
    return (
      <ScreenView center>
        <EmptyState message={t("lecture.loading", "Loading lecture…")} variant="loading" />
      </ScreenView>
    );
  }

  if (!lecture) {
    return (
      <ScreenView center>
        <EmptyState message={t("lecture.notFound", "Lecture not found")} variant="error" />
      </ScreenView>
    );
  }

  if (lecture.rootListing) {
    return (
      <ScreenView center>
        <EmptyState message={t("lecture.loading", "Loading lecture…")} variant="loading" />
      </ScreenView>
    );
  }

  const title = pickContentField(lecture.title, lecture.original?.title, showOriginal);
  const description = lecture.description
    ? pickContentField(lecture.description, lecture.original?.description, showOriginal)
    : undefined;

  if (isContainer) {
    return (
      <ScreenView>
        <View style={styles.headerSection}>
          <AppText variant="titleLg">{title}</AppText>
          <LectureMeta lecture={lecture} />
          {description ? (
            <AppText variant="bodyMd" style={styles.descriptionSection}>
              {description}
            </AppText>
          ) : null}
        </View>
        {ownContents ? (
          <ListingContentView
            contents={ownContents}
            listingRef={{
              id: lecture.id,
              title,
              format: lecture.format,
              scholarName: lecture.scholar.name,
              scholarSlug: lecture.scholar.slug,
              artworkUrl: lecture.scholar.imageUrl ?? undefined,
            }}
            highlightItemId={anchor}
          />
        ) : (
          <EmptyState message={t("lecture.loading", "Loading lessons…")} variant="loading" />
        )}
      </ScreenView>
    );
  }

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

  const handleSave = () => {
    if (isSaved) {
      markUnsaved(lecture.id, lecture.slug);
    } else {
      markSaved(lecture.id, lecture.slug);
    }
  };

  return (
    <ScreenView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppText variant="titleLg">{title}</AppText>
        <LectureMeta lecture={lecture} />

        {/* Quick action buttons side by side */}
        <View style={styles.actionsRow}>
          <View style={styles.actionBtnWrapper}>
            <Button
              variant="primary"
              size="md"
              label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
              icon={
                isCurrentTrack && isPlaying ? (
                  <Pause size={18} color={theme.colors.content.onPrimary} />
                ) : (
                  <Play size={18} color={theme.colors.content.onPrimary} />
                )
              }
              onPress={handlePlay}
            />
          </View>
          <View style={styles.actionBtnWrapper}>
            <Button
              variant="surface"
              size="md"
              label={isSaved ? "Saved" : "Save"}
              icon={
                <Bookmark
                  size={18}
                  color={isSaved ? theme.colors.action.primary : theme.colors.content.strong}
                  fill={isSaved ? theme.colors.action.primary : "none"}
                />
              }
              onPress={handleSave}
            />
          </View>
        </View>

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
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
    paddingBottom: theme.spacing.layout.sectionY,
    gap: theme.spacing.scale.md,
  },
  headerSection: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: theme.spacing.layout.pageY,
    paddingBottom: theme.spacing.scale.sm,
    gap: theme.spacing.scale.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: theme.spacing.scale.md,
    marginVertical: theme.spacing.scale.sm,
  },
  actionBtnWrapper: {
    flex: 1,
  },
  descriptionSection: {
    marginTop: theme.spacing.component.gapLg,
  },
}));
