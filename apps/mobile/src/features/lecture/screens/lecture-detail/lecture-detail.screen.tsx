import { View, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureMeta } from "../../components/lecture-meta/lecture-meta";
import { TopicChips } from "../../components/topic-chips/topic-chips";
import { SeriesContextBar } from "../../components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "../../components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "../../components/lecture-save-button/LectureSaveButton";

export type LectureDetailScreenProps = {
  id: string;
};

export function LectureDetailScreen({ id }: LectureDetailScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);

  if (isFetching) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading lecture...</AppText>
      </ScreenView>
    );
  }

  if (!lecture) {
    return (
      <ScreenView center>
        <AppText variant="titleMd">Lecture not found</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppText variant="titleLg">{lecture.title}</AppText>
        <LectureMeta lecture={lecture} />
        <TopicChips topics={lecture.topics} />

        <View style={styles.playSection}>
          <LecturePlayButton lecture={lecture} />
          <LectureSaveButton lectureId={lecture.id} />
        </View>

        {lecture.description && (
          <View style={styles.descriptionSection}>
            <AppText variant="bodyMd">{lecture.description}</AppText>
          </View>
        )}

        {lecture.seriesContext && <SeriesContextBar seriesContext={lecture.seriesContext} />}
      </ScrollView>
    </ScreenView>
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
