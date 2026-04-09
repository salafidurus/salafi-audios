"use client";

import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useLectureDetailScreen } from "@sd/domain-content";
import { LectureMeta } from "../../components/lecture-meta/lecture-meta";
import { TopicChips } from "../../components/topic-chips/topic-chips";
import { SeriesContextBar } from "../../components/series-context-bar/series-context-bar";
import { LecturePlayButton } from "../../components/lecture-play-button/LecturePlayButton";
import { LectureSaveButton } from "../../components/lecture-save-button/LectureSaveButton";

export type LectureDetailDesktopScreenProps = {
  id: string;
};

export function LectureDetailDesktopScreen({ id }: LectureDetailDesktopScreenProps) {
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
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 40 }}>
        {/* Left column: content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="displayMd">{lecture.title}</AppText>
          <LectureMeta lecture={lecture} />
          <TopicChips topics={lecture.topics} />

          {lecture.description && (
            <div style={{ marginTop: 20 }}>
              <AppText variant="bodyMd" style={{ lineHeight: "1.7" }}>
                {lecture.description}
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
