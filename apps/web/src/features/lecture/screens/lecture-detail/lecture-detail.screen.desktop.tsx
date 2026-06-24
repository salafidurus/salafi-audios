"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useLectureDetail } from "@sd/domain-content";
import { LectureMeta } from "@/features/lecture/components/lecture-meta/lecture-meta";
import { TopicChips } from "@/features/lecture/components/topic-chips/topic-chips";
import { SeriesContextBar } from "@/features/lecture/components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "@/features/lecture/components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "@/features/lecture/components/lecture-save-button/LectureSaveButton";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type LectureDetailDesktopScreenProps = {
  id: string;
};

export function LectureDetailDesktopScreen({ id }: LectureDetailDesktopScreenProps) {
  const { data: lecture, isFetching } = useLectureDetail(id);
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
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 40 }}>
        {/* Left column: content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="displayMd">{title}</AppText>
          <LectureMeta lecture={lecture} />
          <TopicChips topics={lecture.topics} />

          {description && (
            <div style={{ marginTop: 20 }}>
              <AppText variant="bodyMd" style={{ lineHeight: "1.7" }}>
                {description}
              </AppText>
            </div>
          )}

          {lecture.seriesContext && <SeriesContextBar seriesContext={lecture.seriesContext} />}
        </div>

        {/* Right column: play action */}
        <div style={{ width: 240, flexShrink: 0, paddingTop: 8 }}>
          <LecturePlayButton lecture={lecture} />
          <LectureSaveButton lectureId={lecture.id} />
        </div>
      </div>
    </ScreenView>
  );
}
