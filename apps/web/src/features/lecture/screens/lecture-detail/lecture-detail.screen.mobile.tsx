"use client";

import { ScreenViewWeb } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureMetaWeb } from "../../components/lecture-meta/lecture-meta";
import { TopicChipsWeb } from "../../components/topic-chips/topic-chips";
import { SeriesContextBarWeb } from "../../components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "../../components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "../../components/lecture-save-button/LectureSaveButton";

export type LectureDetailMobileWebScreenProps = {
  id: string;
};

export function LectureDetailMobileWebScreen({ id }: LectureDetailMobileWebScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);

  if (isFetching) {
    return (
      <ScreenViewWeb center>
        <AppText variant="bodyMd">Loading lecture...</AppText>
      </ScreenViewWeb>
    );
  }

  if (!lecture) {
    return (
      <ScreenViewWeb center>
        <AppText variant="titleMd">Lecture not found</AppText>
      </ScreenViewWeb>
    );
  }

  return (
    <ScreenViewWeb>
      <AppText variant="titleLg">{lecture.title}</AppText>
      <LectureMetaWeb lecture={lecture} />
      <TopicChipsWeb topics={lecture.topics} />

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

      {lecture.seriesContext && <SeriesContextBarWeb seriesContext={lecture.seriesContext} />}
    </ScreenViewWeb>
  );
}
