"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useListingDetail } from "@sd/domain-content";
import { LectureMeta } from "@/features/listing/components/lecture/lecture-meta/lecture-meta";
import { TopicChips } from "@/features/listing/components/lecture/topic-chips/topic-chips";
import { SeriesContextBar } from "@/features/listing/components/lecture/series-context-bar/series-context-bar";
import { LecturePlayButton } from "@/features/listing/components/lecture/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "@/features/listing/components/lecture/lecture-save-button/LectureSaveButton";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./lecture-detail.screen.module.css";

export type LectureDetailScreenProps = {
  id: string;
};

export function LectureDetailScreen({ id }: LectureDetailScreenProps) {
  const isDesktop = useIsDesktop();
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

  if (isDesktop) {
    return (
      <ScreenView>
        <div className={styles.layout}>
          <div className={styles.contentColumn}>
            <AppText variant="displayMd">{title}</AppText>
            <LectureMeta lecture={lecture} />
            <TopicChips topics={lecture.topics} />

            {description && (
              <div className={styles.descriptionSection}>
                <div className={styles.descriptionText}>
                  <AppText variant="bodyMd">{description}</AppText>
                </div>
              </div>
            )}

            {lecture.seriesContext && <SeriesContextBar seriesContext={lecture.seriesContext} />}
          </div>

          <div className={styles.actionColumn}>
            <LecturePlayButton lecture={lecture} />
            <LectureSaveButton lectureId={lecture.id} />
          </div>
        </div>
      </ScreenView>
    );
  }

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
          <div className={styles.descriptionText}>
            <AppText variant="bodyMd">{description}</AppText>
          </div>
        </div>
      )}

      {lecture.seriesContext && <SeriesContextBar seriesContext={lecture.seriesContext} />}
    </ScreenView>
  );
}
