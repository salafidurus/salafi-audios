"use client";

import { useParams } from "next/navigation";
import { LectureDetailResponsiveScreen } from "../../../../features/lecture/screens/lecture-detail/lecture-detail.screen";

export default function LectureDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <LectureDetailResponsiveScreen
      id={params.id}
      onPlay={() => {
        /* TODO: wire to playback system */
      }}
    />
  );
}
