import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useLectureDetailScreen } from "@sd/domain-content";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { LectureMeta } from "../../components/lecture-meta/lecture-meta";
import { SeriesContextBar } from "../../components/series-context-bar/series-context-bar";
import { TopicChips } from "../../components/topic-chips/topic-chips";

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

        {lecture.description ? (
          <View style={styles.descriptionSection}>
            <AppText variant="bodyMd">{lecture.description}</AppText>
          </View>
        ) : null}

        {lecture.seriesContext ? <SeriesContextBar seriesContext={lecture.seriesContext} /> : null}
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    paddingBottom: theme.spacing.layout.sectionY,
  },
  descriptionSection: {
    marginTop: theme.spacing.component.gapLg,
  },
}));
