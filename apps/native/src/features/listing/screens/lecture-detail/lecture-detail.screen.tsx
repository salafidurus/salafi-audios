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
import { type ComponentProps, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { audioService } from "@/features/audio";
import { DownloadButton } from "@/features/downloads/components/download-button/download-button";
import { DownloadProgress } from "@/features/downloads/components/download-progress/download-progress";
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

function standaloneTrack(
  lecture: NonNullable<ReturnType<typeof useListingDetail>["data"]>,
  title: string,
): Track {
  return {
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
}

async function playLecture(
  lecture: NonNullable<ReturnType<typeof useListingDetail>["data"]>,
  title: string,
  seriesContents: NonNullable<ReturnType<typeof useListingContents>["data"]> | undefined,
  isCurrentTrack: boolean,
  isPlaying: boolean,
): Promise<void> {
  if (isCurrentTrack) {
    if (isPlaying) await audioService.pause();
    else await audioService.resume();
    return;
  }

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
    const track = queue.find((item) => item.id === lecture.id);
    if (track) {
      await audioService.playListing(track, queue);
      return;
    }
  }

  const track = standaloneTrack(lecture, title);
  await audioService.playListing(track, [track]);
}

type LoadedLectureView = {
  lecture: NonNullable<ReturnType<typeof useListingDetail>["data"]>;
  title: string;
  description?: string;
  anchor?: string;
  ownContents: NonNullable<ReturnType<typeof useListingContents>["data"]> | undefined;
  loadingMessage: string;
  isSaved: boolean;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  theme: ReturnType<typeof useUnistyles>["theme"];
  onPlay: () => Promise<void>;
  onSave: () => void;
};

function LectureActions({
  isCurrentTrack,
  isPlaying,
  isSaved,
  theme,
  onPlay,
  onSave,
}: Pick<
  LoadedLectureView,
  "isCurrentTrack" | "isPlaying" | "isSaved" | "theme" | "onPlay" | "onSave"
>) {
  return (
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
          onPress={onPlay}
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
          onPress={onSave}
        />
      </View>
    </View>
  );
}

function getLectureStateView(
  isFetching: boolean,
  lecture: NonNullable<ReturnType<typeof useListingDetail>["data"]> | undefined,
  t: (key: string, fallback: string) => string,
) {
  if (isFetching || lecture?.rootListing) {
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
  return null;
}

function isContainerLecture(
  lecture: NonNullable<ReturnType<typeof useListingDetail>["data"]> | undefined,
): boolean {
  return lecture?.format === "series" || lecture?.format === "collection";
}

function getOwnContentsSlug(
  lecture: NonNullable<ReturnType<typeof useListingDetail>["data"]> | undefined,
): string {
  return isContainerLecture(lecture) ? (lecture?.slug ?? "") : "";
}

function isCurrentLectureTrack(
  lecture: NonNullable<ReturnType<typeof useListingDetail>["data"]> | undefined,
  currentTrack: Track | null,
): boolean {
  return lecture !== undefined && currentTrack?.slug === lecture.slug;
}

function LoadedLectureBody({ view }: { view: LoadedLectureView }) {
  const {
    lecture,
    title,
    description,
    anchor,
    ownContents,
    loadingMessage,
    isSaved,
    isCurrentTrack,
    isPlaying,
    theme,
    onPlay,
    onSave,
  } = view;
  const isContainer = lecture.format === "series" || lecture.format === "collection";
  if (isContainer) {
    const listingRef: ComponentProps<typeof ListingContentView>["listingRef"] = {
      id: lecture.id,
      title,
      format: lecture.format,
      scholarName: lecture.scholar.name,
      scholarSlug: lecture.scholar.slug,
      artworkUrl: lecture.scholar.imageUrl ?? undefined,
    };
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
            listingRef={listingRef}
            highlightItemId={anchor}
          />
        ) : (
          <EmptyState message={loadingMessage} variant="loading" />
        )}
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppText variant="titleLg">{title}</AppText>
        <LectureMeta lecture={lecture} />
        <LectureActions
          isCurrentTrack={isCurrentTrack}
          isPlaying={isPlaying}
          isSaved={isSaved}
          theme={theme}
          onPlay={onPlay}
          onSave={onSave}
        />
        <DownloadProgress listingSlug={lecture.slug} />
        {lecture.primaryAudioAsset?.url ? (
          <DownloadButton listingSlug={lecture.slug} audioUrl={lecture.primaryAudioAsset.url} />
        ) : null}
        <TopicChips topics={lecture.topics} />
        {description ? (
          <View style={styles.descriptionSection}>
            <AppText variant="bodyMd">{description}</AppText>
          </View>
        ) : null}
        {lecture.seriesContext ? (
          <SeriesContextBar seriesContext={lecture.seriesContext} listingSlug={lecture.slug} />
        ) : null}
      </ScrollView>
    </ScreenView>
  );
}

export function LectureDetailScreen({ slug }: LectureDetailScreenProps) {
  const { theme } = useUnistyles();
  const { anchor } = useLocalSearchParams<{ slug: string; anchor?: string }>();
  const { data: lecture, isFetching } = useListingDetail(slug);
  const { data: seriesContents } = useListingContents(lecture?.seriesContext?.seriesSlug ?? "");
  const { data: ownContents } = useListingContents(getOwnContentsSlug(lecture));
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  const { isPlaying, currentTrack } = useAudio();
  const isCurrentTrack = isCurrentLectureTrack(lecture, currentTrack);

  const isSaved = useIsSaved(lecture?.id ?? "");

  // Slugs are flat and don't encode nesting, so a Lesson/Module's own slug
  // resolves to itself — redirect to the top-level page it belongs under,
  // anchored to this item so the parent page can scroll to and highlight it.
  useEffect(() => {
    if (lecture?.rootListing) {
      router.replace(`/listings/${lecture.rootListing.slug}?anchor=${lecture.id}`);
    }
  }, [lecture]);

  const lectureStateView = getLectureStateView(isFetching, lecture, t);
  if (lectureStateView) return lectureStateView;

  if (!lecture) return null;

  const title = pickContentField(lecture.title, lecture.original?.title, showOriginal);
  const description = lecture.description
    ? pickContentField(lecture.description, lecture.original?.description, showOriginal)
    : undefined;

  const handlePlay = async () => {
    await playLecture(lecture, title, seriesContents, isCurrentTrack, isPlaying);
  };

  const handleSave = () => {
    if (isSaved) {
      markUnsaved(lecture.id, lecture.slug);
    } else {
      markSaved(lecture.id, lecture.slug);
    }
  };

  const view: LoadedLectureView = {
    lecture,
    title,
    description,
    anchor,
    ownContents,
    loadingMessage: t("lecture.loading", "Loading lessons…"),
    isSaved,
    isCurrentTrack,
    isPlaying,
    theme,
    onPlay: handlePlay,
    onSave: handleSave,
  };

  return <LoadedLectureBody view={view} />;
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
