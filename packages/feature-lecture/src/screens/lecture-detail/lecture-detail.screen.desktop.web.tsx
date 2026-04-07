"use client";

import { ScreenViewWeb, AppText, ButtonDesktopWeb } from "@sd/shared";
import { useLectureDetailScreen } from "../../hooks/use-lecture-detail";
import { LectureMetaWeb } from "../../components/lecture-meta/lecture-meta.web";
import { TopicChipsWeb } from "../../components/topic-chips/topic-chips.web";
import { SeriesContextBarWeb } from "../../components/series-context-bar/series-context-bar.web";

export type LectureDetailDesktopWebScreenProps = {
  id: string;
  onPlay?: (audioAssetId: string) => void;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function LectureDetailDesktopWebScreen({ id, onPlay }: LectureDetailDesktopWebScreenProps) {
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

  const audioDuration = lecture.primaryAudioAsset?.durationSeconds ?? lecture.durationSeconds;

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
          {lecture.primaryAudioAsset && (
            <div>
              <ButtonDesktopWeb
                variant="primary"
                size="lg"
                onClick={() => onPlay?.(lecture.primaryAudioAsset!.id)}
                style={{ width: "100%" }}
              >
                ▶ Play Lecture
              </ButtonDesktopWeb>
              {audioDuration != null && (
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <AppText variant="caption" style={{ color: "var(--content-muted, #888)" }}>
                    {formatDuration(audioDuration)}
                  </AppText>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ScreenViewWeb>
  );
}
