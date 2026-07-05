import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useListingDetail } from "@sd/domain-content";
import { pickContentField } from "@sd/core-i18n";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { LectureMeta } from "@/features/lecture/components/lecture-meta/lecture-meta";
import { SeriesContextBar } from "@/features/lecture/components/series-context-bar/series-context-bar";
import { TopicChips } from "@/features/lecture/components/topic-chips/topic-chips";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type LectureDetailScreenProps = {
  id: string;
};

export function LectureDetailScreen({ id }: LectureDetailScreenProps) {
  const { data: lecture, isFetching } = useListingDetail(id);
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

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

  return (
    <ScreenView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppText variant="titleLg">{title}</AppText>
        <LectureMeta lecture={lecture} />
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
    paddingBottom: theme.spacing.layout.sectionY,
  },
  descriptionSection: {
    marginTop: theme.spacing.component.gapLg,
  },
}));
