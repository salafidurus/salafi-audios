"use client";

import { useParams } from "next/navigation";
import { LectureDetailResponsiveScreen } from "@sd/feature-lecture";

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
