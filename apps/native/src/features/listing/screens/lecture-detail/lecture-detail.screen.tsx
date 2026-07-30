import type { Track } from "@sd/domain-audio";

import { pickContentField } from "@sd/core-i18n";
import { useAudio, useProgressStore } from "@sd/domain-audio";
import { useListingDetail } from "@sd/domain-content";
import { Play, Pause, Bookmark } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { audioService } from "@/features/audio";
import { LectureMeta } from "@/features/listing/components/lecture-meta/lecture-meta";
import { SeriesContextBar } from "@/features/listing/components/series-context-bar/series-context-bar";
import { TopicChips } from "@/features/listing/components/topic-chips/topic-chips";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/Button/Button";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type LectureDetailScreenProps = {
  slug: string;
};

export function LectureDetailScreen({ slug }: LectureDetailScreenProps) {
  const { theme } = useUnistyles();
  const { data: lecture, isFetching } = useListingDetail(slug);
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  const { isPlaying, currentTrack } = useAudio();
  const isCurrentTrack = lecture ? currentTrack?.id === lecture.id : false;

  const isSaved = useProgressStore((s) => (lecture ? s.actions.isSaved(lecture.id) : false));
  const addSaved = useProgressStore((s) => s.actions.addSaved);
  const removeSaved = useProgressStore((s) => s.actions.removeSaved);

  if (isFetching) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">{t("lecture.loading", "Loading lecture…")}</AppText>
      </ScreenView>
    );
  }

  if (!lecture) {
    return (
      <ScreenView center>
        <AppText variant="titleMd">{t("lecture.notFound", "Lecture not found")}</AppText>
      </ScreenView>
    );
  }

  const title = pickContentField(lecture.title, lecture.original?.title, showOriginal);
  const description = lecture.description
    ? pickContentField(lecture.description, lecture.original?.description, showOriginal)
    : undefined;

  const handlePlay = async () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }

    const track: Track = {
      id: lecture.id,
      title,
      artist: lecture.scholar.name,
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
      removeSaved(lecture.id);
    } else {
      addSaved(lecture.id);
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

        {lecture.seriesContext ? <SeriesContextBar seriesContext={lecture.seriesContext} /> : null}
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
