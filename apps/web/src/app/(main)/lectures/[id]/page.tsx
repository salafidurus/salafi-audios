// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
"use client";
import { useParams } from "next/navigation";
import { LectureDetailScreen } from "@/features/lecture/screens/lecture-detail/lecture-detail.screen";

export default function LectureDetailPage() {
  const params = useParams<{ id: string }>();

  return <LectureDetailScreen id={params.id} />;
}
