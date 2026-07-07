"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useListingDetail } from "@sd/domain-content";
import { LectureMeta } from "@/features/lecture/components/lecture-meta/lecture-meta";
import { TopicChips } from "@/features/lecture/components/topic-chips/topic-chips";
import { SeriesContextBar } from "@/features/lecture/components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "@/features/lecture/components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "@/features/lecture/components/lecture-save-button/LectureSaveButton";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./lecture-detail.screen.mobile.module.css";

export type LectureDetailMobileScreenProps = {
  id: string;
};

export function LectureDetailMobileScreen({ id }: LectureDetailMobileScreenProps) {
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
      <AppText variant="titleLg">{title}</AppText>
      <LectureMeta lecture={lecture} />
      <TopicChips topics={lecture.topics} />

      <div className={styles.actionSection}>
        <LecturePlayButton lecture={lecture} />
        <LectureSaveButton lectureId={lecture.id} />
      </div>

      {description && (
        <div className={styles.descriptionSection}>
          <AppText variant="bodyMd" className={styles.descriptionText}>
            {description}
          </AppText>
        </div>
      )}

      {lecture.seriesContext && <SeriesContextBar seriesContext={lecture.seriesContext} />}
    </ScreenView>
  );
}
