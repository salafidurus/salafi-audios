import { View, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenViewMobileNative } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureMetaNative } from "../../components/lecture-meta/lecture-meta";
import { TopicChipsNative } from "../../components/topic-chips/topic-chips";
import { SeriesContextBarNative } from "../../components/series-context-bar/series-context-bar";
import { LecturePlayButtonNative } from "../../components/lecture-play-button/LecturePlayButton";
import { LectureSaveButtonNative } from "../../components/lecture-save-button/LectureSaveButton";

export type LectureDetailMobileNativeScreenProps = {
  id: string;
};

export function LectureDetailMobileNativeScreen({ id }: LectureDetailMobileNativeScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);

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

  return (
    <ScreenViewMobileNative>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppText variant="titleLg">{lecture.title}</AppText>
        <LectureMetaNative lecture={lecture} />
        <TopicChipsNative topics={lecture.topics} />

        <View style={styles.playSection}>
          <LecturePlayButtonNative lecture={lecture} />
          <LectureSaveButtonNative lectureId={lecture.id} />
        </View>

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
    gap: theme.spacing.component.gapSm,
  },
  descriptionSection: {
    marginTop: theme.spacing.component.gapLg,
  },
}));
