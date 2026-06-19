"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureMeta } from "@/features/lecture/components/lecture-meta/lecture-meta";
import { TopicChips } from "@/features/lecture/components/topic-chips/topic-chips";
import { SeriesContextBar } from "@/features/lecture/components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "@/features/lecture/components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "@/features/lecture/components/lecture-save-button/LectureSaveButton";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type LectureDetailMobileScreenProps = {
  id: string;
};

export function LectureDetailMobileScreen({ id }: LectureDetailMobileScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);
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
      <AppText variant="titleLg">{title}</AppText>
      <LectureMeta lecture={lecture} />
      <TopicChips topics={lecture.topics} />

      <div style={{ marginTop: 20 }}>
        <LecturePlayButton lecture={lecture} />
        <LectureSaveButton lectureId={lecture.id} />
      </div>

      {description && (
        <div style={{ marginTop: 16 }}>
          <AppText variant="bodyMd" style={{ lineHeight: "1.7" }}>
            {description}
          </AppText>
        </div>
      )}

      {lecture.seriesContext && <SeriesContextBar seriesContext={lecture.seriesContext} />}
    </ScreenView>
  );
}
