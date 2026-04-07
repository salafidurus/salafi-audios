"use client";

import { useLectureDetailScreen } from "../../hooks/use-lecture-detail";

export type LectureDetailMobileWebScreenProps = {
  id: string;
  onPlay?: (audioAssetId: string) => void;
};

export function LectureDetailMobileWebScreen({ id, onPlay }: LectureDetailMobileWebScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading lecture...</div>;
  }

  if (!lecture) {
    return <div style={{ padding: 16 }}>Lecture not found</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>{lecture.title}</h1>
      {lecture.scholarId && (
        <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>Scholar: {lecture.scholarId}</p>
      )}
      {lecture.description && <p style={{ fontSize: 14, marginTop: 12 }}>{lecture.description}</p>}
      {lecture.primaryAudioAsset && (
        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={() => onPlay?.(lecture.primaryAudioAsset!.id)}
            style={{
              width: "100%",
              padding: "12px 0",
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
          <div style={{ fontSize: 12, color: "#888", marginTop: 6, textAlign: "center" }}>
            {lecture.primaryAudioAsset.durationSeconds
              ? `${Math.round(lecture.primaryAudioAsset.durationSeconds / 60)} min`
              : "Duration unknown"}
          </div>
        </div>
      )}
    </div>
  );
}
