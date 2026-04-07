import { View, Text, ScrollView, Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ScreenViewMobileNative, AppText, ButtonMobileNative } from "@sd/shared";
import { useLectureDetailScreen } from "../../hooks/use-lecture-detail";
import { LectureMetaNative } from "../../components/lecture-meta/lecture-meta.native";
import { TopicChipsNative } from "../../components/topic-chips/topic-chips.native";
import { SeriesContextBarNative } from "../../components/series-context-bar/series-context-bar.native";

export type LectureDetailMobileNativeScreenProps = {
  id: string;
  onPlay?: (audioAssetId: string) => void;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function LectureDetailMobileNativeScreen({
  id,
  onPlay,
}: LectureDetailMobileNativeScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);
  const { theme } = useUnistyles();

  if (isFetching) {
    return (
      <ScreenViewMobileNative center>
        <AppText variant="bodyMd">Loading lecture...</AppText>
      </ScreenViewMobileNative>
    );
  }

  if (!lecture) {
    return (
      <ScreenViewMobileNative center>
        <AppText variant="titleMd">Lecture not found</AppText>
      </ScreenViewMobileNative>
    );
  }

  const audioDuration = lecture.primaryAudioAsset?.durationSeconds ?? lecture.durationSeconds;

  return (
    <ScreenViewMobileNative>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppText variant="titleLg">{lecture.title}</AppText>
        <LectureMetaNative lecture={lecture} />
        <TopicChipsNative topics={lecture.topics} />

        {lecture.primaryAudioAsset && (
          <View style={styles.playSection}>
            <ButtonMobileNative
              variant="primary"
              size="lg"
              fullWidth
              label="▶ Play Lecture"
              onPress={() => onPlay?.(lecture.primaryAudioAsset!.id)}
            />
            {audioDuration != null && (
              <Text style={[styles.durationText, { color: theme.colors.content.muted }]}>
                {formatDuration(audioDuration)}
              </Text>
            )}
          </View>
        )}

        {lecture.description && (
          <View style={styles.descriptionSection}>
            <AppText variant="bodyMd">{lecture.description}</AppText>
          </View>
        )}

        {lecture.seriesContext && <SeriesContextBarNative seriesContext={lecture.seriesContext} />}
      </ScrollView>
    </ScreenViewMobileNative>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    paddingBottom: theme.spacing.layout.sectionY,
  },
  playSection: {
    marginTop: theme.spacing.layout.sectionY,
    alignItems: "center",
  },
  durationText: {
    ...theme.typography.caption,
    textAlign: "center",
    marginTop: theme.spacing.component.gapSm,
  },
  descriptionSection: {
    marginTop: theme.spacing.component.gapLg,
  },
}));
