"use client";

import { ScreenViewWeb } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureMetaWeb } from "../../components/lecture-meta/lecture-meta";
import { TopicChipsWeb } from "../../components/topic-chips/topic-chips";
import { SeriesContextBarWeb } from "../../components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "../../components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "../../components/lecture-save-button/LectureSaveButton";

export type LectureDetailDesktopWebScreenProps = {
  id: string;
};

export function LectureDetailDesktopWebScreen({ id }: LectureDetailDesktopWebScreenProps) {
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
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 40 }}>
        {/* Left column: content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="displayMd">{lecture.title}</AppText>
          <LectureMetaWeb lecture={lecture} />
          <TopicChipsWeb topics={lecture.topics} />

          {lecture.description && (
            <div style={{ marginTop: 20 }}>
              <AppText variant="bodyMd" style={{ lineHeight: "1.7" }}>
                {lecture.description}
              </AppText>
            </div>
          )}

          {lecture.seriesContext && <SeriesContextBarWeb seriesContext={lecture.seriesContext} />}
        </div>

        {/* Right column: play action */}
        <div style={{ width: 240, flexShrink: 0, paddingTop: 8 }}>
          <LecturePlayButton lecture={lecture} />
          <LectureSaveButton lectureId={lecture.id} />
        </div>
      </div>
    </ScreenViewWeb>
  );
}
