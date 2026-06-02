"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureMeta } from "@/features/lecture/components/lecture-meta/lecture-meta";
import { TopicChips } from "@/features/lecture/components/topic-chips/topic-chips";
import { SeriesContextBar } from "@/features/lecture/components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "@/features/lecture/components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "@/features/lecture/components/lecture-save-button/LectureSaveButton";

export type LectureDetailMobileScreenProps = {
  id: string;
};

export function LectureDetailMobileScreen({ id }: LectureDetailMobileScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);

  if (isFetching) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading lecture…</AppText>
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
      <AppText variant="titleLg">{lecture.title}</AppText>
      <LectureMeta lecture={lecture} />
      <TopicChips topics={lecture.topics} />

      <div style={{ marginTop: 20 }}>
        <LecturePlayButton lecture={lecture} />
        <LectureSaveButton lectureId={lecture.id} />
      </div>

      {lecture.description && (
        <div style={{ marginTop: 16 }}>
          <AppText variant="bodyMd" style={{ lineHeight: "1.7" }}>
            {lecture.description}
          </AppText>
        </div>
      )}

      {lecture.seriesContext && <SeriesContextBar seriesContext={lecture.seriesContext} />}
    </ScreenView>
  );
}
