"use client";

import { useLectureDetailScreen } from "../../hooks/use-lecture-detail";

export type LectureDetailDesktopWebScreenProps = {
  id: string;
  onPlay?: (audioAssetId: string) => void;
};

export function LectureDetailDesktopWebScreen({ id, onPlay }: LectureDetailDesktopWebScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading lecture...</div>;
  }

  if (!lecture) {
    return <div style={{ padding: 32 }}>Lecture not found</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>{lecture.title}</h1>
      {lecture.scholarId && (
        <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>Scholar: {lecture.scholarId}</p>
      )}
      {lecture.description && <p style={{ marginTop: 16 }}>{lecture.description}</p>}
      {lecture.primaryAudioAsset && (
        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            onClick={() => onPlay?.(lecture.primaryAudioAsset!.id)}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Play Lecture
          </button>
          <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
            {lecture.primaryAudioAsset.durationSeconds
              ? `${Math.round(lecture.primaryAudioAsset.durationSeconds / 60)} min`
              : "Duration unknown"}
          </div>
        </div>
      )}
    </div>
  );
}
